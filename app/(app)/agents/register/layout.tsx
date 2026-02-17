import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become an Agent | Zenland",
  description:
    "Register as a dispute resolution agent on Zenland. Stake tokens to arbitrate escrow disputes and earn fees while helping the decentralized escrow community.",
  keywords: [
    "become agent",
    "dispute resolution",
    "crypto arbitration",
    "escrow agent",
    "blockchain arbitrator",
    "earn crypto",
    "staking",
  ],
  openGraph: {
    title: "Become an Agent | Zenland",
    description:
      "Register as a dispute resolution agent on Zenland. Stake tokens to arbitrate escrow disputes and earn fees.",
    type: "website",
    url: "https://zen.land/agents/register",
  },
  twitter: {
    card: "summary_large_image",
    title: "Become an Agent | Zenland",
    description:
      "Register as a dispute resolution agent on Zenland. Stake tokens to arbitrate escrow disputes and earn fees.",
  },
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
