<div align="center">

# OFFHUNTER

[![CI](https://github.com/N0tMaggi/OFFHUNTER/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/N0tMaggi/OFFHUNTER/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-v7-2D3748?logo=prisma&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-lightgrey)

A Discord bot that hunts deals from **marktguru.de** and posts them in your server — on demand or on a schedule. Supports pagination, savings display, product images, and per-server configuration.

<img src=".github/assets/showcase.gif" alt="OFFHUNTER showcase" width="900">

</div>

---

## Quick Start

```bash
git clone https://github.com/N0tMaggi/OFFHUNTER.git
cd OFFHUNTER
npm install
cp .env.example .env       # fill in DISCORD_TOKEN
npm run db:migrate
npm run dev
```

---

## Commands

### `/deals`

Searches marktguru.de and returns a paginated embed. All options fall back to your server's saved configuration.

| Option | Description |
|---|---|
| `query` | Search term — e.g. `Red Bull` |
| `zip` | German postal code |
| `retailers` | Comma-separated filter — e.g. `lidl,rewe,aldi-sued` |
| `max_price` | Price ceiling in € |

Each result shows the current price, original price with savings percentage if on sale, per-unit reference price, validity dates, and a loyalty card notice where required. Use **Prev** / **Next** to page through results and **Refresh** to re-fetch live data.

---

### `/setup` — requires Manage Server

| Subcommand | Description | Example |
|---|---|---|
| `channel #ch` | Channel for automatic posts | `/setup channel #deals` |
| `keywords <terms>` | Comma-separated search terms | `/setup keywords red bull, monster` |
| `schedule <cron>` | Posting schedule | `/setup schedule 0 8 * * *` |
| `zip <code>` | Postal code | `/setup zip 10115` |
| `retailers <list>` | Retailer allowlist | `/setup retailers lidl, aldi-sued` |
| `maxprice <price>` | Max price in € — 0 for no limit | `/setup maxprice 1.50` |
| `view` | Show current config | `/setup view` |
| `reset` | Clear all config | `/setup reset` |

**Cron quick reference** — [crontab.guru](https://crontab.guru) for more:

| Expression | Meaning |
|---|---|
| `0 8 * * *` | Daily at 8am |
| `0 8 * * 1` | Every Monday at 8am |
| `0 8,18 * * *` | 8am and 6pm every day |
| `0 9 * * 1,4` | Monday and Thursday at 9am |

---

## Database

SQLite by default — zero setup. Switch by editing `prisma/schema.prisma` and `.env`, then running `npm run db:migrate`.

| Database | `provider` | `DATABASE_URL` |
|---|---|---|
| SQLite | `sqlite` | `file:./offhunter.db` |
| PostgreSQL | `postgresql` | `postgresql://user:pass@host:5432/offhunter` |
| MySQL / MariaDB | `mysql` | `mysql://user:pass@host:3306/offhunter` |

---

## Docker

```bash
# SQLite
docker compose --profile sqlite up -d

# PostgreSQL (includes a bundled Postgres container)
docker compose --profile postgres up -d
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DISCORD_TOKEN` | Yes | — | Bot token from [Discord Developer Portal](https://discord.com/developers/applications) |
| `DATABASE_URL` | Yes | — | Database connection string |
| `DEFAULT_ZIP` | No | `60487` | Fallback postal code for searches |
