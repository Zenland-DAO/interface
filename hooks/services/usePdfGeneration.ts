'use client';

/**
 * Hook for generating escrow agreement PDFs
 * 
 * Calls the PDF service to generate a PDF document and receives
 * the PDF bytes directly. Creates a temporary blob URL for display
 * and computes the termsHash (keccak256 of PDF bytes) client-side.
 * 
 * IMPORTANT: The PDF is stored in browser memory only.
 * Users must download and save the file before closing the page.
 * 
 * IMPORTANT: The termsHash is computed from the actual PDF bytes, not from
 * request parameters. This ensures the hash truly represents the document
 * content and can be used for verification.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { keccak256, toHex, type Address, type Hex } from 'viem';

// =====================================
// Types
// =====================================

/** Supported languages for PDF generation */
export type PdfLanguage = 'en' | 'ru' | 'es' | 'zh';

/** Request payload for PDF generation */
export interface GeneratePdfRequest {
  language?: PdfLanguage;
  buyerAddress: Address;
  sellerAddress: Address;
  agentAddress: Address | null;
  tokenSymbol: string;
  tokenAddress: Address;
  /** Token decimals for amount/fees formatting in the PDF (e.g. USDC=6). */
  tokenDecimals?: number;
  amount: string;
  buyerProtectionTime: number;
  terms: string;
  escrowAddress: Address;
  creationFee: string;
  assignmentFee: string;
  createdAt?: number;
  isLocked: boolean;
  /** Chain ID for network identification */
  chainId: number;
  /** Human-readable network name */
  network: string;
}

/** Response from PDF generation (with computed hash) */
export interface GeneratePdfResponse {
  /** Blob URL for viewing/downloading the PDF (temporary, browser memory only) */
  pdfUrl: string;
  /** keccak256 hash of the PDF bytes - computed client-side */
  termsHash: Hex;
  /** 
   * Whether the PDF is stored temporarily in browser memory.
   * Always true - used to trigger UX warnings about saving the file.
   */
  isTemporary: true;
  /** Suggested filename for download */
  suggestedFilename: string;
}

/** Hook return type */
export interface UsePdfGenerationReturn {
  /** Generate PDF and return URL + termsHash */
  generatePdf: (request: GeneratePdfRequest) => Promise<GeneratePdfResponse>;
  /** Current generation status */
  status: 'idle' | 'loading' | 'success' | 'error';
  /** Generated PDF data */
  data: GeneratePdfResponse | null;
  /** Error message if generation failed */
  error: string | null;
  /** Reset state and clean up blob URL */
  reset: () => void;
  /** Manually revoke the blob URL (call when done with the PDF) */
  cleanup: () => void;
}

// =====================================
// Configuration
// =====================================

/** PDF service base URL - configurable via environment variable */
const PDF_SERVICE_URL = process.env.NEXT_PUBLIC_PDF_URL ?? 'http://localhost:3002';

// =====================================
// Utility Functions
// =====================================

/**
 * Computes keccak256 hash from PDF bytes
 * 
 * @param bytes - The PDF bytes as Uint8Array
 * @returns keccak256 hash of the PDF bytes
 */
function computeTermsHashFromBytes(bytes: Uint8Array): Hex {
  const hexData = toHex(bytes);
  const hash = keccak256(hexData);
  return hash;
}

/**
 * Creates a blob URL from PDF ArrayBuffer
 * 
 * @param arrayBuffer - The PDF data as ArrayBuffer
 * @returns Blob URL that can be used for viewing/downloading
 */
function createBlobUrl(arrayBuffer: ArrayBuffer): string {
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

// =====================================
// Hook Implementation
// =====================================

/**
 * Hook for generating escrow agreement PDFs
 * 
 * The hook:
 * 1. Calls the PDF service which returns PDF bytes directly
 * 2. Creates a temporary blob URL for viewing/downloading
 * 3. Computes termsHash = keccak256(pdfBytes) client-side
 * 
 * PRIVACY: No PDFs are stored on any server. The PDF exists only
 * in the user's browser memory and is lost when the page closes.
 * 
 * This ensures the hash truly represents the PDF content and can be
 * verified by anyone with access to the PDF file.
 * 
 * @example
 * ```tsx
 * const { generatePdf, status, data, error, cleanup } = usePdfGeneration();
 * 
 * const handleGenerate = async () => {
 *   try {
 *     const result = await generatePdf({
 *       buyerAddress: '0x...',
 *       sellerAddress: '0x...',
 *       // ... other fields
 *     });
 *     console.log('PDF URL:', result.pdfUrl);
 *     console.log('Terms Hash:', result.termsHash);
 *     
 *     // Important: result.isTemporary is always true
 *     // Show warning to user to download the PDF
 *   } catch (err) {
 *     console.error('Failed to generate PDF:', err);
 *   }
 * };
 * 
 * // Clean up when done
 * useEffect(() => {
 *   return () => cleanup();
 * }, [cleanup]);
 * ```
 */
export function usePdfGeneration(): UsePdfGenerationReturn {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [data, setData] = useState<GeneratePdfResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track current blob URL for cleanup
  const blobUrlRef = useRef<string | null>(null);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const cleanup = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const generatePdf = useCallback(async (request: GeneratePdfRequest): Promise<GeneratePdfResponse> => {
    setStatus('loading');
    setError(null);

    // Clean up previous blob URL if exists
    cleanup();

    try {
      // Build request body
      const body: GeneratePdfRequest = {
        ...request,
        language: request.language ?? 'en',
        createdAt: request.createdAt ?? Math.floor(Date.now() / 1000),
        tokenDecimals: request.tokenDecimals ?? 6,
      };

      // Call PDF service - it returns PDF bytes directly
      const response = await fetch(`${PDF_SERVICE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // Handle error responses
      if (!response.ok) {
        // Try to parse error as JSON, fallback to status text
        const contentType = response.headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error ?? errorData.message ?? `HTTP ${response.status}`);
        }
        throw new Error(`PDF generation failed: HTTP ${response.status}`);
      }

      // Get PDF bytes directly from response
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Validate we got reasonable PDF data
      if (bytes.length < 100) {
        throw new Error('Invalid PDF response: file too small');
      }

      // Check PDF magic bytes (%PDF-)
      const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]);
      if (header !== '%PDF-') {
        throw new Error('Invalid PDF response: not a valid PDF file');
      }

      // Compute termsHash from bytes
      const termsHash = computeTermsHashFromBytes(bytes);

      // Create blob URL for viewing/downloading
      const pdfUrl = createBlobUrl(arrayBuffer);
      blobUrlRef.current = pdfUrl;

      // Generate suggested filename
      const shortAddress = request.escrowAddress.slice(0, 10);
      const suggestedFilename = `escrow-agreement-${shortAddress}.pdf`;

      // Build result
      const result: GeneratePdfResponse = {
        pdfUrl,
        termsHash,
        isTemporary: true,
        suggestedFilename,
      };

      setStatus('success');
      setData(result);

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate PDF';
      setStatus('error');
      setError(message);
      throw err;
    }
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setStatus('idle');
    setData(null);
    setError(null);
  }, [cleanup]);

  return {
    generatePdf,
    status,
    data,
    error,
    reset,
    cleanup,
  };
}

