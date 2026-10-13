import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { VerifyClient } from "./VerifyClient";

export const metadata: Metadata = {
  ...pageMetadata({
    path: "/verify",
    title: "Verify PDF",
    description:
      "Verify the authenticity of a Zenland escrow agreement PDF. Check if your escrow contract document is genuine and matches the on-chain data.",
  }),
  keywords: [
    "verify escrow",
    "PDF verification",
    "escrow agreement",
    "document authenticity",
    "blockchain verification",
    "smart contract verification",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function VerifyPage() {
  return <VerifyClient />;
}
