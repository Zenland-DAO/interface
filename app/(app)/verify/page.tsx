import { Metadata } from "next";
import { VerifyClient } from "./VerifyClient";

export const metadata: Metadata = {
  title: "Verify PDF | Zenland",
  description: "Verify the authenticity of a Zenland escrow agreement PDF",
};

export default function VerifyPage() {
  return <VerifyClient />;
}
