import { LocaleData } from './types';

const de: LocaleData = {
  commands: {
    deals: {
      name: 'angebote',
      description: 'Sucht nach Angeboten auf marktguru.de',
      options: {
        query:    'Suchbegriff, z.B. "Red Bull"',
        zip:      'Postleitzahl (Standard: Servereinstellung)',
        retailers:'Händlerfilter, kommagetrennt, z.B. "lidl,rewe"',
        max_price:'Maximaler Preis in €',
      },
    },
    setup: {
      name: 'einstellungen',
      description: 'OFFHUNTER für diesen Server konfigurieren',
      subs: {
        channel: {
          name: 'kanal',
          description: 'Kanal für automatische Angebotsbenachrichtigungen setzen',
          optDesc: 'Zielkanal',
          success: id => `Kanal auf <#${id}> gesetzt.`,
        },
        keywords: {
          name: 'suchbegriffe',
          description: 'Suchbegriffe festlegen (kommagetrennt)',
          optDesc: 'z.B. "Energy Drink, Red Bull"',
          success: terms => `Suchbegriffe auf \`${terms}\` aktualisiert.`,
        },
        schedule: {
          name: 'zeitplan',
          description: 'Posting-Zeitplan als Cron-Ausdruck festlegen',
          optDesc: 'z.B. "0 8 * * *" = täglich um 8 Uhr',
          success: expr => `Zeitplan auf \`${expr}\` aktualisiert.`,
          invalid: 'Beispiel: `0 8 * * *` (täglich um 8 Uhr)\nMehr Hilfe: https://crontab.guru',
        },
        zip: {
          name: 'plz',
          description: 'Postleitzahl für die Angebotssuche setzen',
          optDesc: 'Deutsche PLZ, z.B. 10115',
          success: code => `Postleitzahl auf \`${code}\` gesetzt.`,
        },
        retailers: {
          name: 'haendler',
          description: 'Angebote nach Händler filtern (kommagetrennt, leer = alle)',
          optDesc: 'z.B. "lidl, rewe, aldi-sued"',
          success: val => `Händlerfilter auf \`${val}\` gesetzt.`,
          cleared: 'Händlerfilter aufgehoben (alle Händler).',
        },
        maxprice: {
          name: 'maxpreis',
          description: 'Maximalen Angebotspreis in € festlegen (0 = kein Limit)',
          optDesc: 'Preis in €',
          success: val => `Maximaler Preis auf \`${val} €\` gesetzt.`,
          cleared: 'Preislimit aufgehoben.',
        },
        deallink: {
          name: 'deallink',
          description: 'Externen Deal-Link-Button in den Ergebnissen ein- oder ausblenden',
          optDesc: 'Deal-Link-Button aktivieren',
          enabled: 'Deal-Link-Button aktiviert.',
          disabled: 'Deal-Link-Button deaktiviert.',
        },
        view: {
          name: 'anzeigen',
          description: 'Aktuelle Konfiguration anzeigen',
          title: 'OFFHUNTER — Serverkonfiguration',
          footer: name => `/${name} <unterbefehl> zum Ändern verwenden.`,
          noConfig: 'Keine Konfiguration gefunden',
          noConfigDetail: (name, ch) => `Beginne mit \`/${name} ${ch}\`.`,
          fields: {
            channel:  'Kanal',
            keywords: 'Suchbegriffe',
            schedule: 'Zeitplan',
            zip:      'Postleitzahl',
            retailers:'Händler',
            maxPrice: 'Max-Preis',
            dealLink: 'Deal-Link',
            all:      'Alle',
            none:     'Kein Limit',
            enabled:  'Aktiviert',
            disabled: 'Deaktiviert',
          },
        },
        reset: {
          name: 'zuruecksetzen',
          description: 'Gesamte Serverkonfiguration löschen',
          success: 'Konfiguration gelöscht.',
        },
      },
      errors: {
        serverOnly: { title: 'Nur auf Servern',              detail: 'Dieser Befehl kann nur auf einem Server verwendet werden.' },
        noConfig:   { title: 'Keine Konfiguration gefunden', detail: (name, ch) => `Starte mit \`/${name} ${ch}\`.` },
      },
    },
  },
  embeds: {
    deals: {
      noResults:       'Keine Angebote gefunden. Versuche einen anderen Suchbegriff oder passe deine Filter an.',
      title:           (q, n) => `${q}  —  ${n} Angebot${n !== 1 ? 'e' : ''} gefunden`,
      allRetailers:    'alle Händler',
      loyaltyRequired: 'Kundenkarte erforderlich',
      pageFooter:      (p, t) => `${p} / ${t}  ·  marktguru.de`,
    },
    errors: {
      fetchFailed:        { title: 'Fehler beim Laden der Angebote',  detail: 'Die marktguru-API ist möglicherweise vorübergehend nicht erreichbar. Versuche es gleich erneut.' },
      interactionExpired: { title: 'Interaktion abgelaufen',          detail: name => `Nutze \`/${name}\` für eine neue Suche.` },
      refreshFailed:      { title: 'Aktualisierung fehlgeschlagen',   detail: 'marktguru konnte nicht erreicht werden. Versuche es erneut.' },
    },
  },
  buttons: {
    prev:     'Zurück',
    next:     'Weiter',
    refresh:  'Aktualisieren',
    viewDeal: 'Angebot ansehen',
  },
};

export default de;
