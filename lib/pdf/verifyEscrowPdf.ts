import { PDFDocument } from 'pdf-lib';
import { isAddress, type Address, type Hex } from 'viem';
import { recoverMessageAddress } from 'viem';
import { stringifyCanonicalJson, type JsonValue } from './canonicalJson';

export const ZENLAND_ESCROW_PDF_SCHEMA_V1 = 'zenland.escrow_pdf.v1' as const;

/**
 * Hardcoded trust anchor.
 *
 * IMPORTANT: set this to your Zenland PDF signer address.
 * Anyone verifying must already know this address from a trusted source.
 */
export const ZENLAND_PDF_ALLOWED_SIGNERS: readonly Address[] = [
  // Production signer derived from PDF_SIGNING_PRIVATE_KEY
  '0x04311E018004AF0a8Ab3e74ABf75675D88Bd2549',
];

export interface ZenlandEscrowPdfUnsignedMetadataV1 {
  schema: typeof ZENLAND_ESCROW_PDF_SCHEMA_V1;
  createdAt: number;
  escrow: {
    escrowAddress: string;
    chainId: number;
    network: string;
    isLocked: boolean;
    buyer: string;
    seller: string;
    agent: string | null;
    token: {
      address: string;
      symbol: string;
    };
    amount: string;
    timeouts: {
      buyerProtectionTime: number;
      sellerAcceptTime: number;
      agentResponseTime: number;
    };
  };
}

export interface ZenlandEscrowPdfSignature {
  alg: 'secp256k1';
  scheme: 'eip191';
  kid?: string;
  signer: string;
  sig: Hex;
}

export interface ZenlandEscrowPdfEnvelopeV1 extends ZenlandEscrowPdfUnsignedMetadataV1 {
  signing: ZenlandEscrowPdfSignature;
}

export interface VerifyZenlandEscrowPdfResult {
  ok: boolean;
  signer?: Address;
  envelope?: ZenlandEscrowPdfEnvelopeV1;
  reason?: string;
}

function base64UrlDecodeToUtf8(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);

  // Browser-safe decode (no Buffer)
  // atob expects base64, not base64url.
  const binary = globalThis.atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function parseEnvelopeFromSubject(subject: string | undefined): ZenlandEscrowPdfEnvelopeV1 | null {
  if (!subject) return null;
  const prefix = 'zenland:escrow_pdf:v1:';
  if (!subject.startsWith(prefix)) return null;

  const payload = subject.slice(prefix.length);
  try {
    const json = base64UrlDecodeToUtf8(payload);
    return JSON.parse(json) as ZenlandEscrowPdfEnvelopeV1;
  } catch {
    return null;
  }
}

function getUnsignedForVerification(envelope: ZenlandEscrowPdfEnvelopeV1): ZenlandEscrowPdfUnsignedMetadataV1 {
  const { signing, ...unsigned } = envelope;
  void signing;
  return unsigned;
}

function signingMessage(unsigned: ZenlandEscrowPdfUnsignedMetadataV1): string {
  return stringifyCanonicalJson(unsigned as unknown as JsonValue);
}

/**
 * Verify a Zenland escrow PDF.
 *
 * Extraction priority:
 * 1) Info.subject (fast, robust)
 * 2) XMP / attachment could be added later if needed
 */
export async function verifyZenlandEscrowPdf(
  pdfBytes: Uint8Array,
  opts: { allowedSigners?: readonly Address[] } = {}
): Promise<VerifyZenlandEscrowPdfResult> {
  const allowedSigners = opts.allowedSigners ?? ZENLAND_PDF_ALLOWED_SIGNERS;

  const doc = await PDFDocument.load(pdfBytes);
  const subject = doc.getSubject();
  const envelope = parseEnvelopeFromSubject(subject ?? undefined);
  if (!envelope) {
    return { ok: false, reason: 'Missing or invalid zenland metadata in PDF subject' };
  }

  if (envelope.schema !== ZENLAND_ESCROW_PDF_SCHEMA_V1) {
    return { ok: false, reason: `Unsupported schema: ${envelope.schema}` };
  }

  const sig = envelope.signing?.sig;
  if (!sig) {
    return { ok: false, reason: 'Missing signature' };
  }

  const message = signingMessage(getUnsignedForVerification(envelope));
  const signer = await recoverMessageAddress({ message, signature: sig });

  if (!isAddress(signer)) {
    return { ok: false, reason: 'Recovered signer is not a valid address' };
  }
  if (!allowedSigners.map((s) => s.toLowerCase()).includes(signer.toLowerCase())) {
    return { ok: false, reason: `Signer not allowed: ${signer}` };
  }

  return { ok: true, signer: signer as Address, envelope };
}
