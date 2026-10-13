import NextLink from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, Heading, Text, Container } from "@/components/ui";
import { SITE_URL, pageMetadata } from "@/lib/seo";

/**
 * USDT Escrow landing page (English only for now)
 *
 * Targets the stablecoin-escrow search cluster (usdt escrow, tether escrow,
 * stablecoin escrow services). Content is inline rather than in locale files
 * because it isn't translated yet. Localized URLs (/es/usdt-escrow, ...) show the
 * same English content, and the canonical always points at the English URL.
 */

const PATH = "/usdt-escrow";
const PAGE_URL = `${SITE_URL}${PATH}`;

export async function generateMetadata() {
  return pageMetadata({
    path: PATH,
    title: "USDT Escrow Service on Ethereum",
    description:
      "Escrow USDT or USDC with a smart contract instead of a middleman. Funds release on delivery, disputes go to a staked agent. 1% fee, capped at $50.",
  });
}

const FACTS = [
  { label: "Tokens", value: "USDT & USDC (ERC-20, Ethereum mainnet)" },
  { label: "Protocol fee", value: "1% (min $0.50, max $50)" },
  { label: "Custody", value: "None: funds sit in the escrow contract" },
  { label: "Buyer protection", value: "7, 14, 30 days or custom (up to 365)" },
];

const STEPS = [
  {
    title: "The buyer creates and funds the escrow",
    body: "Enter the seller's wallet address, the amount in USDT or USDC, the written terms of the deal, a buyer protection period, and a dispute agent. The funds move into a dedicated escrow contract, and Zenland generates a PDF agreement that is cryptographically linked to that contract.",
  },
  {
    title: "The seller accepts the terms",
    body: "The seller reviews the terms and accepts within the acceptance window. If they decline, the buyer is refunded. If they never respond, the buyer can cancel once the window expires and get a full refund.",
  },
  {
    title: "The seller delivers and marks the escrow fulfilled",
    body: "Marking the escrow fulfilled starts the buyer protection period, the time the buyer has to check the delivery and either release the funds or open a dispute.",
  },
  {
    title: "The buyer releases the funds",
    body: "Release is a single transaction and the seller receives the USDT immediately. If the buyer does nothing until the protection period ends, the seller can claim the funds, so an unresponsive buyer can't hold the payment hostage.",
  },
  {
    title: "If something goes wrong: dispute",
    body: "The buyer can open a dispute during the protection period, which pauses the escrow. The parties can propose a split themselves (if both approve, funds are distributed automatically) or invite the assigned agent, who reviews the case and decides how the funds are split. Agents must respond within a deadline (7 days by default); if they don't, the parties can claim a timeout and continue without them.",
  },
];

const FAQ = [
  {
    question: "Is USDT escrow on Zenland safe?",
    answer:
      "Your USDT is held by a smart contract on Ethereum, not by Zenland or any company. Nobody, including the Zenland team, can move the funds outside the rules of the contract: release by the buyer, a claim by the seller after the protection period, an agreed split, or an agent's decision in a dispute. The contract source code is public on GitHub and every escrow can be inspected on Etherscan.",
  },
  {
    question: "Can I escrow TRC-20 USDT (Tron)?",
    answer:
      "No. Zenland runs on Ethereum mainnet, so it supports ERC-20 USDT and USDC only. If you hold USDT on Tron or another network, bridge or withdraw it to an Ethereum address first.",
  },
  {
    question: "How much does a USDT escrow cost?",
    answer:
      "The protocol fee is 1% of the escrow amount, with a minimum of $0.50 and a maximum of $50. For example, a 2,000 USDT escrow costs 20 USDT, and anything above 5,000 USDT costs the $50 maximum. Agents set their own assignment and dispute fees (between 0.1% and 10%), shown before you choose one. Ethereum gas is paid separately, or not at all with the NYKNYC smart wallet.",
  },
  {
    question: "How long does a USDT escrow take?",
    answer:
      "Funding and release are each a single on-chain transaction, so the money moves as fast as the deal does. The buyer protection period you choose (7, 14, or 30 days, or a custom 1 to 365 days) is the longest a seller might wait after delivery if the buyer never responds.",
  },
  {
    question: "Should I use USDT or USDC?",
    answer:
      "Either works the same way. Use whichever stablecoin both sides already hold so nobody pays a conversion spread.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. There is no sign-up: you connect an Ethereum wallet such as MetaMask, Rabby, Base Account, any WalletConnect wallet, or NYKNYC for gas-free transactions.",
  },
];

export default function UsdtEscrowPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${PAGE_URL}#faq`,
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="py-16 sm:py-20 lg:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container size="md">
        {/* Hero */}
        <header className="mb-16">
          <Heading level={1} className="mb-6">
            USDT Escrow Service on Ethereum
          </Heading>
          <Text variant="lead" className="mb-8">
            Lock USDT (Tether) or USDC in a smart contract instead of handing it to a middleman.
            The seller gets paid when they deliver, the buyer gets a refund window if they
            don&apos;t, and a staked agent settles disputes. Non-custodial, with a 1% fee capped
            at $50.
          </Text>
          <div className="flex flex-row flex-wrap items-start gap-3">
            <NextLink href="/escrows/new" className="shrink-0">
              <Button size="lg" className="group whitespace-nowrap">
                Create a USDT escrow
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </NextLink>
            <a href="#how-it-works" className="shrink-0">
              <Button variant="outline" size="lg" className="whitespace-nowrap">
                How it works
              </Button>
            </a>
          </div>
        </header>

        {/* Key facts */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {FACTS.map((fact) => (
            <div
              key={fact.label}
              className="p-5 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-secondary)]"
            >
              <dt className="text-sm text-[var(--text-tertiary)] mb-1">{fact.label}</dt>
              <dd className="font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {/* What is USDT escrow */}
        <section className="mb-16">
          <Heading level={2} className="text-3xl mb-6">
            What is USDT escrow?
          </Heading>
          <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
            USDT escrow holds a stablecoin payment in a neutral place until both sides have done
            what they agreed to. It protects the buyer from paying for something that never
            arrives, and the seller from delivering to someone who never pays.
          </Text>
          <Text className="text-[var(--text-secondary)] leading-relaxed mb-4">
            Most crypto escrow services do this by having a company hold your funds and decide
            when to release them. Zenland replaces the company with a smart contract on Ethereum.
            Each escrow is its own contract, and the funds can only leave it according to rules
            both parties accepted up front.
          </Text>
          <Text className="text-[var(--text-secondary)] leading-relaxed">
            Because USDT and USDC track the US dollar, the amount in escrow keeps its value for
            the whole deal. That makes stablecoin escrow a good fit for OTC trades, freelance and
            agency work, digital goods, and domain or account sales.
          </Text>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mb-16 scroll-mt-24">
          <Heading level={2} className="text-3xl mb-6">
            How a USDT escrow works on Zenland
          </Heading>
          <ol className="space-y-6">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/10 text-primary-500 font-semibold flex items-center justify-center">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <Text className="text-[var(--text-secondary)] leading-relaxed">{step.body}</Text>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Fees */}
        <section className="mb-16">
          <Heading level={2} className="text-3xl mb-6">
            Fees
          </Heading>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-secondary)]">
                  <th className="py-3 pr-4 font-semibold">Fee</th>
                  <th className="py-3 pr-4 font-semibold">Amount</th>
                  <th className="py-3 font-semibold">When</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-secondary)]">
                  <td className="py-3 pr-4">Protocol fee</td>
                  <td className="py-3 pr-4">1% of the amount, min $0.50, max $50</td>
                  <td className="py-3">Added on top when the escrow is created</td>
                </tr>
                <tr className="border-b border-[var(--border-secondary)]">
                  <td className="py-3 pr-4">Agent assignment fee</td>
                  <td className="py-3 pr-4">Set by the agent (0.1% to 10%)</td>
                  <td className="py-3">When an agent is assigned, even if no dispute happens</td>
                </tr>
                <tr className="border-b border-[var(--border-secondary)]">
                  <td className="py-3 pr-4">Agent dispute fee</td>
                  <td className="py-3 pr-4">Set by the agent (0.1% to 10%)</td>
                  <td className="py-3">Only if the agent resolves a dispute</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Ethereum gas</td>
                  <td className="py-3 pr-4">Network fee in ETH</td>
                  <td className="py-3">Each transaction; zero with the NYKNYC wallet</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Text className="text-[var(--text-secondary)] leading-relaxed">
            Example: a 2,000 USDT escrow pays a 20 USDT protocol fee. Because the fee is capped,
            a 50,000 USDT escrow still pays only $50.
          </Text>
        </section>

        {/* Why a smart contract */}
        <section className="mb-16">
          <Heading level={2} className="text-3xl mb-6">
            Why a smart contract instead of an escrow company
          </Heading>
          <ul className="space-y-4">
            {[
              ["Non-custodial", "Zenland never holds your USDT. Funds sit in the escrow contract, not in a company wallet that can be frozen, hacked, or run off with."],
              ["Transparent", "Every escrow is a public contract on Ethereum you can inspect on Etherscan, and the contract source code is open on GitHub."],
              ["Verifiable agreement", "The PDF agreement is linked to the contract on-chain. Anyone can check that a PDF is genuine with Zenland's free verification tool."],
              ["Accountable agents", "Agents stake stablecoins and DAO tokens to take cases. They can only handle escrows up to 20× their stablecoin stake, and the DAO can slash agents who misbehave."],
              ["Capped fees", "1% with a $50 maximum, whether you escrow 5,000 or 500,000 USDT."],
            ].map(([title, body]) => (
              <li key={title} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0 mt-1" />
                <Text className="text-[var(--text-secondary)] leading-relaxed">
                  <span className="font-semibold text-[var(--text-primary)]">{title}.</span> {body}
                </Text>
              </li>
            ))}
          </ul>
        </section>

        {/* Limits */}
        <section className="mb-16 p-6 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-secondary)]">
          <Heading level={2} className="text-2xl mb-4">
            What to know before you start
          </Heading>
          <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2">
            <li>Ethereum mainnet only: TRC-20 (Tron) or BEP-20 USDT is not supported.</li>
            <li>Stablecoins only: Zenland doesn&apos;t escrow BTC or ETH.</li>
            <li>
              Always assign an agent. Without one, a dispute can&apos;t be resolved and the funds can
              stay locked if the parties disagree.
            </li>
            <li>
              Zenland is a protocol governed by a DAO, not a licensed escrow company, and isn&apos;t
              designed for regulated transactions such as real estate closings.
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-16">
          <Heading level={2} className="text-3xl mb-6">
            USDT escrow FAQ
          </Heading>
          <div className="space-y-8">
            {FAQ.map((item) => (
              <div key={item.question}>
                <h3 className="text-xl font-semibold mb-2">{item.question}</h3>
                <Text className="text-[var(--text-secondary)] leading-relaxed">{item.answer}</Text>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pt-8 border-t border-[var(--border-secondary)]">
          <Heading level={2} className="text-3xl mb-4">
            Ready to escrow USDT?
          </Heading>
          <Text variant="lead" className="mb-8">
            Connect a wallet and set up your first escrow in a few minutes.
          </Text>
          <NextLink href="/escrows/new">
            <Button size="lg" className="group">
              Create a USDT escrow
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </NextLink>
          <Text variant="small" className="mt-6 text-[var(--text-tertiary)]">
            Prefer to watch first?{" "}
            <a
              href="https://www.youtube.com/watch?v=zZCREbx8b8g"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 hover:text-primary-400 underline"
            >
              See the step-by-step USDT escrow tutorial
            </a>
            . Want the details?{" "}
            <NextLink href="/verify" className="text-primary-500 hover:text-primary-400 underline">
              Verify an agreement PDF
            </NextLink>{" "}
            or read the{" "}
            <a
              href="https://docs.zen.land/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 hover:text-primary-400 underline"
            >
              documentation
            </a>
            .
          </Text>
        </section>
      </Container>
    </div>
  );
}
