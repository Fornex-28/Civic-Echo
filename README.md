# Civic Echo

Nepal's first decentralized anonymous civic reporting platform — powered by Solana.

## Features

- 🗺️ **Interactive Map** — Report civic issues by clicking anywhere on a 3D Mapbox map of Nepal
- 🔐 **Anonymous Reporting** — Zero-knowledge identity verification ensures complete anonymity
- ⛓️ **On-Chain** — Reports are stored on Solana devnet for immutability
- 🗄️ **Supabase Backend** — Persistent data storage with real-time capabilities
- 📊 **Dashboard** — Track your reports, echoes, and petitions
- 🏆 **Leaderboard** — Top reporters and most active districts

## Tech Stack

- **Frontend**: Next.js 16, React 19, Framer Motion, Tailwind CSS
- **Blockchain**: Solana (Devnet), Anchor Framework
- **Database**: Supabase (PostgreSQL)
- **Maps**: Mapbox GL JS
- **Wallet**: Phantom via Solana Wallet Adapter

## Getting Started

```bash
cd frontend
npm install
cp .env.local.example .env.local  # Fill in your keys
npm run dev
```

## Environment Variables

```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=your_program_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## License

MIT
