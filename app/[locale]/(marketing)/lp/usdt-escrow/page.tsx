import NextLink from "next/link";
import { ArrowRight, Check, PlayCircle } from "lucide-react";
import { Button, Heading, Text, Container } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

/**
 * Ad landing page for display campaigns (A-ADS first). English only.
 *
 * Separate from /usdt-escrow so the indexed search page stays as it is. This
 * page is noindex and not in the sitemap; visitors arrive from banners only.
 *
 * Ad networks reject ads whose claims are missing from the landing page, so
 * every line on the banners and in the text ad must stay here in plain text:
 * the 2,000 USDT example and its 20 USDT fee, "1% fee, max $50", the smart
 * contract holding the funds, payment on delivery, the 14-day buyer
 * protection, the staked agent, no sign-up, open source.
 */

const PATH = "/lp/usdt-escrow";
const CREATE_HREF = "/escrows/new";
const VIDEO_URL = "https://www.youtube.com/watch?v=zZCREbx8b8g";
const FACTORY_URL = "https://etherscan.io/address/0xba2c6322fd59e2703a28d82db572950297600129";
const SOURCE_URL = "https://github.com/zenland-dao/core";

export async function generateMetadata() {
  return {
    ...pageMetadata({
      path: PATH,
      title: "Paying a stranger in USDT? Use escrow",
      description:
        "Lock USDT or USDC in a smart contract. The seller is paid when they deliver, and a staked agent settles disputes. 1% fee, max $50. No sign-up.",
    }),
    robots: { index: false, follow: true },
  };
}

const TRACK = ["Funded", "Delivered", "Released"];

const STEPS = [
  {
    title: "You lock the payment",
    body: "Enter the seller's wallet address, the amount and the terms of the deal. The USDT moves into an escrow contract made for this one deal. No company holds your money.",
  },
  {
    title: "The seller delivers",
    body: "The seller sees the money is locked, accepts the terms and delivers. You then have a buyer protection period (7, 14 or 30 days, or your own) to check what you got.",
  },
  {
    title: "You release the funds",
    body: "One transaction and the seller is paid. If something is wrong, you open a dispute and a staked agent decides how the funds are split.",
  },
];

const NEEDS = [
  "An Ethereum wallet: MetaMask, Rabby, any WalletConnect wallet, or NYKNYC",
  "USDT or USDC on Ethereum (ERC-20). USDT on Tron (TRC-20) or BNB Chain is not supported",
  "The seller's Ethereum wallet address",
  "A little ETH for gas, or none at all with the NYKNYC wallet",
];

const USES = [
  "Buying or selling crypto over the counter (OTC)",
  "Paying a freelancer or an agency you found online",
  "Digital goods, domains, websites and accounts",
];

function EscrowCard() {
  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 shadow-2xl shadow-primary-500/10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
          Escrow contract
        </span>
        <span className="rounded-full bg-success-500/10 px-2.5 py-1 text-xs font-semibold text-success-500">
          Released
        </span>
      </div>
      <p className="text-4xl font-bold tracking-tight mb-6">
        2,000 <span className="text-lg font-semibold text-[var(--text-tertiary)]">USDT</span>
      </p>
      <ol className="relative flex justify-between mb-6">
        <span aria-hidden className="absolute left-4 right-4 top-[11px] h-0.5 bg-success-500" />
        {TRACK.map((label) => (
          <li key={label} className="relative flex flex-col items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success-500 text-white">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className="text-xs font-medium">{label}</span>
          </li>
        ))}
      </ol>
      <dl className="space-y-2 border-t border-[var(--border-secondary)] pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-[var(--text-tertiary)]">Seller received</dt>
          <dd className="font-semibold">2,000 USDT</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--text-tertiary)]">Buyer protection</dt>
          <dd className="font-semibold">14 days</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--text-tertiary)]">Fee paid</dt>
          <dd className="font-semibold">20 USDT (1%)</dd>
        </div>
      </dl>
    </div>
  );
}

function CreateButton() {
  return (
    <NextLink href={CREATE_HREF} className="shrink-0">
      <Button size="lg" className="group whitespace-nowrap">
        Create an escrow
        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </NextLink>
  );
}

export default function UsdtEscrowAdPage() {
  return (
    <div className="py-12 sm:py-16 lg:py-20">
      <Container size="lg">
        {/* Hero */}
        <header className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-primary-500">
              USDT &amp; USDC escrow on Ethereum
            </p>
            <Heading level={1} className="mb-6 lg:!text-6xl">
              Paying a stranger in USDT?
            </Heading>
            <Text variant="lead" className="mb-8">
              Lock it in escrow. A smart contract holds the funds, not a middleman, and the
              seller gets paid when they deliver. 1% fee, max $50.
            </Text>
            <div className="flex flex-row flex-wrap items-start gap-3 mb-6">
              <CreateButton />
              <a href={VIDEO_URL} target="_blank" rel="noopener noreferrer" className="shrink-0">
                <Button variant="outline" size="lg" className="whitespace-nowrap">
                  <PlayCircle className="mr-2 w-4 h-4" />
                  Watch how it works
                </Button>
              </a>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--text-secondary)]">
              {["No sign-up, connect a wallet", "Non-custodial", "Open source"].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-success-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <EscrowCard />
        </header>

        {/* How it works */}
        <section className="mb-20">
          <Heading level={2} className="text-3xl mb-8">
            One deal, three steps
          </Heading>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="p-6 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-secondary)]"
              >
                <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 font-semibold text-primary-500">
                  {index + 1}
                </span>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <Text className="text-[var(--text-secondary)] leading-relaxed">{step.body}</Text>
              </li>
            ))}
          </ol>
        </section>

        {/* Fee + proof */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <div className="p-6 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-secondary)]">
            <Heading level={2} className="text-2xl mb-4">
              1% fee, max $50
            </Heading>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>A 2,000 USDT escrow costs 20 USDT.</li>
              <li>A 50,000 USDT escrow costs $50, because the fee is capped.</li>
              <li>The minimum fee is $0.50.</li>
              <li>
                The dispute agent you choose sets their own fee (0.1% to 10%), shown before you
                pick one.
              </li>
            </ul>
          </div>
          <div className="p-6 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-secondary)]">
            <Heading level={2} className="text-2xl mb-4">
              Check it yourself
            </Heading>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>Live on Ethereum mainnet since February 2026.</li>
              <li>
                Every escrow is its own contract.{" "}
                <a
                  href={FACTORY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:text-primary-400 underline"
                >
                  See the factory contract on Etherscan
                </a>
                .
              </li>
              <li>
                The contracts are open source.{" "}
                <a
                  href={SOURCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:text-primary-400 underline"
                >
                  Read the code on GitHub
                </a>
                .
              </li>
              <li>
                Agents stake their own stablecoins to take disputes, and the DAO can slash an
                agent who misbehaves.
              </li>
            </ul>
          </div>
        </section>

        {/* Fit */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
          <div>
            <Heading level={2} className="text-2xl mb-4">
              What people use it for
            </Heading>
            <ul className="space-y-3">
              {USES.map((item) => (
                <li key={item} className="flex gap-3 text-[var(--text-secondary)]">
                  <Check className="h-5 w-5 flex-shrink-0 text-success-500 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Text className="mt-6 text-[var(--text-secondary)] leading-relaxed">
              <span className="font-semibold text-[var(--text-primary)]">Are you the seller?</span>{" "}
              The buyer creates the escrow. Send them this page, give them your wallet address,
              and deliver once you see the funds locked.
            </Text>
          </div>
          <div>
            <Heading level={2} className="text-2xl mb-4">
              What you need
            </Heading>
            <ul className="space-y-3">
              {NEEDS.map((item) => (
                <li key={item} className="flex gap-3 text-[var(--text-secondary)]">
                  <Check className="h-5 w-5 flex-shrink-0 text-success-500 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pt-12 border-t border-[var(--border-secondary)]">
          <Heading level={2} className="text-3xl mb-4">
            Lock the payment before you send it
          </Heading>
          <Text variant="lead" className="mb-8">
            No sign-up. Connect a wallet and fill in one form.
          </Text>
          <div className="flex justify-center">
            <CreateButton />
          </div>
          <Text variant="small" className="mt-6 text-[var(--text-tertiary)]">
            Want every detail first?{" "}
            <NextLink href="/usdt-escrow" className="text-primary-500 hover:text-primary-400 underline">
              Read the full USDT escrow guide
            </NextLink>
            .
          </Text>
        </section>
      </Container>
    </div>
  );
}
