# OFFHUNTER

Discord bot that hunts deals on [marktguru.de](https://marktguru.de) and posts them directly in your server — on demand or on a schedule.

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/N0tMaggi/OFFHUNTER.git
cd OFFHUNTER
npm install

# 2. Configure
cp .env.example .env
# → fill in DISCORD_TOKEN

# 3. Set up the database and start
npm run db:migrate
npm run dev
```

---

## Commands

### `/deals`
Search for deals on demand.

| Option | Description | Default |
|---|---|---|
| `query` | Search term | Server keyword or `energy drink` |
| `zip` | German postal code | Server setting or `60487` |
| `retailers` | Comma-separated filter (e.g. `lidl,rewe`) | All |
| `max_price` | Price ceiling in € | No limit |

Results show up to 5 per page with **◀ Prev**, **▶ Next**, and **🔄 Refresh** buttons.

---

### `/setup` *(requires Manage Server)*

| Subcommand | Description | Example |
|---|---|---|
| `channel #ch` | Set the channel for auto posts | `/setup channel #deals` |
| `keywords <terms>` | Comma-separated search terms | `/setup keywords red bull, monster` |
| `schedule <cron>` | Cron expression for auto posts | `/setup schedule 0 8 * * *` |
| `zip <code>` | German postal code | `/setup zip 10115` |
| `retailers <list>` | Retailer allowlist | `/setup retailers lidl, aldi-sued` |
| `maxprice <price>` | Max deal price in € (0 = no limit) | `/setup maxprice 1.50` |
| `view` | Show current config | `/setup view` |
| `reset` | Clear all config | `/setup reset` |

**Cron examples:**
- `0 8 * * *` — daily at 8am
- `0 8 * * 1` — every Monday at 8am
- `0 8,18 * * *` — twice a day (8am and 6pm)

---

## Database

SQLite by default. Switch by editing `prisma/schema.prisma` and your `.env`:

| Database | `provider` in schema | `DATABASE_URL` |
|---|---|---|
| SQLite | `sqlite` | `file:./offhunter.db` |
| PostgreSQL | `postgresql` | `postgresql://user:pass@host:5432/offhunter` |
| MySQL / MariaDB | `mysql` | `mysql://user:pass@host:3306/offhunter` |

After switching: `npm run db:migrate`

---

## Docker

```bash
# SQLite (simplest)
docker compose --profile sqlite up -d

# PostgreSQL (recommended for multi-server use)
docker compose --profile postgres up -d
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DISCORD_TOKEN` | ✅ | Your bot token from [discord.com/developers](https://discord.com/developers/applications) |
| `DATABASE_URL` | ✅ | Database connection string |
| `DEFAULT_ZIP` | ❌ | Fallback postal code (default: `60487`) |
