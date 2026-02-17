import type { Metadata } from "next";
import { VerifyClient } from "./VerifyClient";

export const metadata: Metadata = {
  title: "Verify PDF | Zenland",
  description:
    "Verify the authenticity of a Zenland escrow agreement PDF. Check if your escrow contract document is genuine and matches the on-chain data.",
  keywords: [
    "verify escrow",
    "PDF verification",
    "escrow agreement",
    "document authenticity",
    "blockchain verification",
    "smart contract verification",
  ],
  openGraph: {
    title: "Verify PDF | Zenland",
    description:
      "Verify the authenticity of a Zenland escrow agreement PDF. Check if your escrow contract document is genuine.",
    type: "website",
    url: "https://zen.land/verify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verify PDF | Zenland",
    description:
      "Verify the authenticity of a Zenland escrow agreement PDF. Check if your escrow contract document is genuine.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function VerifyPage() {
  return <VerifyClient />;
}
