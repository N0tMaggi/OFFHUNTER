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

**Language / Sprache / Taal:**
[🇬🇧 English](#-english) · [🇩🇪 Deutsch](#-deutsch) · [🇳🇱 Nederlands](#-nederlands)

</div>

---

## 🇬🇧 English

### Quick Start

```bash
git clone https://github.com/N0tMaggi/OFFHUNTER.git
cd OFFHUNTER
npm install
cp .env.example .env       # fill in DISCORD_TOKEN and set LOCALE=en
npm run db:migrate
npm run dev
```

### Commands

#### `/deals`

Searches marktguru.de and returns a paginated embed. All options fall back to your server's saved configuration.

| Option | Description |
|---|---|
| `query` | Search term — e.g. `Red Bull` |
| `zip` | German postal code |
| `retailers` | Comma-separated filter — e.g. `lidl,rewe,aldi-sued` |
| `max_price` | Price ceiling in € |

Each result shows the current price, original price with savings percentage if on sale, per-unit reference price, validity dates, and a loyalty card notice where required. Use **Prev** / **Next** to page through results and **Refresh** to re-fetch live data.

#### `/setup` — requires Manage Server

| Subcommand | Description | Example |
|---|---|---|
| `channel #ch` | Channel for automatic posts | `/setup channel #deals` |
| `keywords <terms>` | Comma-separated search terms | `/setup keywords red bull, monster` |
| `schedule <cron>` | Posting schedule | `/setup schedule 0 8 * * *` |
| `zip <code>` | Postal code | `/setup zip 10115` |
| `retailers <list>` | Retailer allowlist | `/setup retailers lidl, aldi-sued` |
| `maxprice <price>` | Max price in € — 0 for no limit | `/setup maxprice 1.50` |
| `deallink <true\|false>` | Show "View Deal" button (off by default — links route through ad trackers) | `/setup deallink true` |
| `view` | Show current config | `/setup view` |
| `reset` | Clear all config | `/setup reset` |

**Cron quick reference** — [crontab.guru](https://crontab.guru) for more:

| Expression | Meaning |
|---|---|
| `0 8 * * *` | Daily at 8am |
| `0 8 * * 1` | Every Monday at 8am |
| `0 8,18 * * *` | 8am and 6pm every day |
| `0 9 * * 1,4` | Monday and Thursday at 9am |

### Database

SQLite by default — zero setup. Switch by editing `prisma/schema.prisma` and `.env`, then running `npm run db:migrate`.

| Database | `provider` | `DATABASE_URL` |
|---|---|---|
| SQLite | `sqlite` | `file:./offhunter.db` |
| PostgreSQL | `postgresql` | `postgresql://user:pass@host:5432/offhunter` |
| MySQL / MariaDB | `mysql` | `mysql://user:pass@host:3306/offhunter` |

### Docker

```bash
# SQLite
docker compose --profile sqlite up -d

# PostgreSQL (includes a bundled Postgres container)
docker compose --profile postgres up -d
```

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DISCORD_TOKEN` | Yes | — | Bot token from [Discord Developer Portal](https://discord.com/developers/applications) |
| `DATABASE_URL` | Yes | — | Database connection string |
| `DEFAULT_ZIP` | No | `60487` | Fallback postal code for searches |
| `LOCALE` | No | `en` | Bot language — `en`, `de`, or `nl` |

---

## 🇩🇪 Deutsch

### Schnellstart

```bash
git clone https://github.com/N0tMaggi/OFFHUNTER.git
cd OFFHUNTER
npm install
cp .env.example .env       # DISCORD_TOKEN eintragen und LOCALE=de setzen
npm run db:migrate
npm run dev
```

### Befehle

#### `/angebote`

Durchsucht marktguru.de und gibt ein seitenweises Embed zurück. Alle Optionen fallen auf die gespeicherte Serverkonfiguration zurück.

| Option | Beschreibung |
|---|---|
| `query` | Suchbegriff — z.B. `Red Bull` |
| `zip` | Postleitzahl |
| `retailers` | Kommagetrennte Händlerliste — z.B. `lidl,rewe,aldi-sued` |
| `max_price` | Maximaler Preis in € |

Jedes Ergebnis zeigt den aktuellen Preis, den Originalpreis mit Ersparnis in Prozent (falls im Angebot), Referenzpreis pro Einheit, Gültigkeitszeitraum und einen Hinweis auf erforderliche Kundenkarte. **Zurück** / **Weiter** zum Blättern, **Aktualisieren** für neue Live-Daten.

#### `/einstellungen` — erfordert Server verwalten

| Unterbefehl | Beschreibung | Beispiel |
|---|---|---|
| `kanal #kanal` | Kanal für automatische Beiträge | `/einstellungen kanal #angebote` |
| `suchbegriffe <begriffe>` | Kommagetrennte Suchbegriffe | `/einstellungen suchbegriffe red bull, monster` |
| `zeitplan <cron>` | Posting-Zeitplan | `/einstellungen zeitplan 0 8 * * *` |
| `plz <code>` | Postleitzahl | `/einstellungen plz 10115` |
| `haendler <liste>` | Händler-Zulassliste | `/einstellungen haendler lidl, aldi-sued` |
| `maxpreis <preis>` | Max-Preis in € — 0 = kein Limit | `/einstellungen maxpreis 1.50` |
| `deallink <true\|false>` | "Angebot ansehen"-Button (standard aus — Links laufen über Ad-Tracker) | `/einstellungen deallink true` |
| `anzeigen` | Aktuelle Konfiguration anzeigen | `/einstellungen anzeigen` |
| `zuruecksetzen` | Gesamte Konfiguration löschen | `/einstellungen zuruecksetzen` |

**Cron-Kurzreferenz** — mehr unter [crontab.guru](https://crontab.guru):

| Ausdruck | Bedeutung |
|---|---|
| `0 8 * * *` | Täglich um 8 Uhr |
| `0 8 * * 1` | Jeden Montag um 8 Uhr |
| `0 8,18 * * *` | Täglich um 8 und 18 Uhr |
| `0 9 * * 1,4` | Montag und Donnerstag um 9 Uhr |

### Datenbank

Standardmäßig SQLite — kein Setup erforderlich. Wechsel durch Anpassen von `prisma/schema.prisma` und `.env`, dann `npm run db:migrate` ausführen.

| Datenbank | `provider` | `DATABASE_URL` |
|---|---|---|
| SQLite | `sqlite` | `file:./offhunter.db` |
| PostgreSQL | `postgresql` | `postgresql://user:pass@host:5432/offhunter` |
| MySQL / MariaDB | `mysql` | `mysql://user:pass@host:3306/offhunter` |

### Docker

```bash
# SQLite
docker compose --profile sqlite up -d

# PostgreSQL (inklusive Postgres-Container)
docker compose --profile postgres up -d
```

### Umgebungsvariablen

| Variable | Pflicht | Standard | Beschreibung |
|---|---|---|---|
| `DISCORD_TOKEN` | Ja | — | Bot-Token vom [Discord Developer Portal](https://discord.com/developers/applications) |
| `DATABASE_URL` | Ja | — | Datenbankverbindungsstring |
| `DEFAULT_ZIP` | Nein | `60487` | Standard-Postleitzahl für Suchen |
| `LOCALE` | Nein | `en` | Bot-Sprache — `en`, `de` oder `nl` |

---

## 🇳🇱 Nederlands

### Snel starten

```bash
git clone https://github.com/N0tMaggi/OFFHUNTER.git
cd OFFHUNTER
npm install
cp .env.example .env       # DISCORD_TOKEN invullen en LOCALE=nl instellen
npm run db:migrate
npm run dev
```

### Commando's

#### `/aanbiedingen`

Doorzoekt marktguru.de en geeft een gepagineerde embed terug. Alle opties vallen terug op de opgeslagen serverconfiguratie.

| Optie | Beschrijving |
|---|---|
| `query` | Zoekterm — bijv. `Red Bull` |
| `zip` | Duitse postcode |
| `retailers` | Kommagescheiden winkellijst — bijv. `lidl,rewe,aldi-sued` |
| `max_price` | Maximale prijs in € |

Elk resultaat toont de huidige prijs, de originele prijs met besparingspercentage (indien in aanbieding), referentieprijs per eenheid, geldigheidsdatum en een melding over loyaliteitskaart indien vereist. Gebruik **Vorige** / **Volgende** om te bladeren en **Vernieuwen** voor verse live-data.

#### `/instellingen` — vereist Server beheren

| Subcommando | Beschrijving | Voorbeeld |
|---|---|---|
| `kanaal #kanaal` | Kanaal voor automatische berichten | `/instellingen kanaal #aanbiedingen` |
| `zoektermen <termen>` | Kommagescheiden zoektermen | `/instellingen zoektermen red bull, monster` |
| `planning <cron>` | Berichtschema | `/instellingen planning 0 8 * * *` |
| `postcode <code>` | Postcode | `/instellingen postcode 10115` |
| `winkels <lijst>` | Winkel-allowlist | `/instellingen winkels lidl, aldi-sued` |
| `maxprijs <prijs>` | Max. prijs in € — 0 = geen limiet | `/instellingen maxprijs 1.50` |
| `deallink <true\|false>` | "Aanbieding bekijken"-knop (standaard uit — links lopen via ad-trackers) | `/instellingen deallink true` |
| `weergeven` | Huidige configuratie weergeven | `/instellingen weergeven` |
| `resetten` | Alle configuratie wissen | `/instellingen resetten` |

**Cron-snelreferentie** — meer op [crontab.guru](https://crontab.guru):

| Expressie | Betekenis |
|---|---|
| `0 8 * * *` | Dagelijks om 8u |
| `0 8 * * 1` | Elke maandag om 8u |
| `0 8,18 * * *` | Dagelijks om 8u en 18u |
| `0 9 * * 1,4` | Maandag en donderdag om 9u |

### Database

Standaard SQLite — geen setup nodig. Schakel over door `prisma/schema.prisma` en `.env` aan te passen en `npm run db:migrate` uit te voeren.

| Database | `provider` | `DATABASE_URL` |
|---|---|---|
| SQLite | `sqlite` | `file:./offhunter.db` |
| PostgreSQL | `postgresql` | `postgresql://user:pass@host:5432/offhunter` |
| MySQL / MariaDB | `mysql` | `mysql://user:pass@host:3306/offhunter` |

### Docker

```bash
# SQLite
docker compose --profile sqlite up -d

# PostgreSQL (inclusief Postgres-container)
docker compose --profile postgres up -d
```

### Omgevingsvariabelen

| Variabele | Verplicht | Standaard | Beschrijving |
|---|---|---|---|
| `DISCORD_TOKEN` | Ja | — | Bot-token van het [Discord Developer Portal](https://discord.com/developers/applications) |
| `DATABASE_URL` | Ja | — | Databaseverbindingsstring |
| `DEFAULT_ZIP` | Nee | `60487` | Standaard postcode voor zoekopdrachten |
| `LOCALE` | Nee | `en` | Bot-taal — `en`, `de` of `nl` |
