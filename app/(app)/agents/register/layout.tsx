import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    path: "/agents/register",
    title: "Become an Agent",
    description:
      "Register as a dispute resolution agent on Zenland. Stake tokens to arbitrate escrow disputes and earn fees while helping the decentralized escrow community.",
  }),
  keywords: [
    "become agent",
    "dispute resolution",
    "crypto arbitration",
    "escrow agent",
    "blockchain arbitrator",
    "earn crypto",
    "staking",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function AgentRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
