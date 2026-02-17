import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Escrow | Zenland",
  description:
    "Create a secure crypto escrow contract for your transactions. Protect both buyers and sellers with smart contract-based escrow on multiple blockchain networks.",
  keywords: [
    "create escrow",
    "crypto escrow",
    "blockchain escrow",
    "smart contract escrow",
    "secure transactions",
    "buyer protection",
    "seller protection",
  ],
  openGraph: {
    title: "Create Escrow | Zenland",
    description:
      "Create a secure crypto escrow contract for your transactions. Protect both buyers and sellers with smart contract-based escrow.",
    type: "website",
    url: "https://zen.land/escrows/new",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Escrow | Zenland",
    description:
      "Create a secure crypto escrow contract for your transactions.",
  },
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
