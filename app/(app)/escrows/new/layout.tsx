import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    path: "/escrows/new",
    title: "Create Escrow",
    description:
      "Create a secure crypto escrow contract for your transactions. Protect both buyers and sellers with smart contract-based escrow on multiple blockchain networks.",
  }),
  keywords: [
    "create escrow",
    "crypto escrow",
    "blockchain escrow",
    "smart contract escrow",
    "secure transactions",
    "buyer protection",
    "seller protection",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function NewEscrowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
