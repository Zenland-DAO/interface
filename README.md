# Zenland Interface

The official web interface for [Zenland](https://zen.land) — a decentralized escrow protocol for secure peer-to-peer transactions.

## Overview

This interface provides a user-friendly way to interact with Zenland smart contracts, allowing users to:

- Create and manage escrow agreements
- Track transaction status and milestones
- Resolve disputes through the agent network
- Connect with multiple wallet providers

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Web3**: wagmi v3 + viem
- **State**: TanStack Query
- **i18n**: next-intl

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Zenland-DAO/interface.git
cd interface

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3001`

### Environment Variables

Create a `.env.local` file with the required variables. See the deployment documentation for details.

## Project Structure

```
interface/
├── app/                 # Next.js App Router pages
│   ├── (app)/          # Authenticated app routes
│   └── [locale]/       # Localized marketing pages
├── components/
│   ├── app/            # App-specific components
│   ├── marketing/      # Landing page components
│   ├── shared/         # Reusable components
│   └── ui/             # Base UI components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── locales/            # Translation files
└── public/             # Static assets
```

## Related Repositories

- **Smart Contracts**: [Zenland-DAO/core](https://github.com/Zenland-DAO/core) — Core escrow protocol contracts
- **Documentation**: [docs.zen.land](https://docs.zen.land)

## License

This project is licensed under the [Business Source License 1.1](LICENSE).

- **Change Date**: February 11, 2030
- **Change License**: MIT License

The BSL allows you to view, modify, and use the code for non-production purposes. After the Change Date, the code will be available under the MIT License.

For production use before the Change Date, please contact the Zenland DAO.
