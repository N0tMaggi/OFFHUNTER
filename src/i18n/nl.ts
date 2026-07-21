import { LocaleData } from './types.js';

const nl: LocaleData = {
  commands: {
    deals: {
      name: 'aanbiedingen',
      description: 'Zoek naar aanbiedingen op marktguru.de',
      options: {
        query:    'Zoekterm, bijv. "Red Bull"',
        zip:      'Duitse postcode (standaard: serverinstelling)',
        retailers:'Winkelfilter, kommagescheiden, bijv. "lidl,rewe"',
        max_price:'Maximale prijs in €',
      },
    },
    setup: {
      name: 'instellingen',
      description: 'OFFHUNTER instellen voor deze server',
      subs: {
        channel: {
          name: 'kanaal',
          description: 'Kanaal instellen voor automatische berichtplaatsing',
          optDesc: 'Doelkanaal',
          success: id => `Kanaal ingesteld op <#${id}>.`,
        },
        keywords: {
          name: 'zoektermen',
          description: 'Zoektermen instellen (kommagescheiden)',
          optDesc: 'bijv. "energy drink, red bull"',
          success: terms => `Zoektermen bijgewerkt naar \`${terms}\`.`,
        },
        schedule: {
          name: 'planning',
          description: 'Berichtschema instellen als cron-expressie',
          optDesc: 'bijv. "0 8 * * *" = dagelijks om 8u',
          success: expr => `Planning bijgewerkt naar \`${expr}\`.`,
          invalid: 'Voorbeeld: `0 8 * * *` (dagelijks om 8u)\nMeer info: https://crontab.guru',
        },
        zip: {
          name: 'postcode',
          description: 'Postcode instellen voor zoeken naar aanbiedingen',
          optDesc: 'Duitse postcode, bijv. 10115',
          success: code => `Postcode ingesteld op \`${code}\`.`,
        },
        retailers: {
          name: 'winkels',
          description: 'Aanbiedingen filteren op winkel (kommagescheiden, leeg = alle)',
          optDesc: 'bijv. "lidl, rewe, aldi-sued"',
          success: val => `Winkelfilter ingesteld op \`${val}\`.`,
          cleared: 'Winkelfilter verwijderd (alle winkels).',
        },
        maxprice: {
          name: 'maxprijs',
          description: 'Maximale aanbiedingsprijs instellen in € (0 = geen limiet)',
          optDesc: 'Prijs in €',
          success: val => `Maximale prijs ingesteld op \`${val} €\`.`,
          cleared: 'Prijslimiet verwijderd.',
        },
        deallink: {
          name: 'deallink',
          description: 'Externe deallink-knop in resultaten tonen of verbergen',
          optDesc: 'Deallink-knop inschakelen',
          enabled: 'Deallink-knop ingeschakeld.',
          disabled: 'Deallink-knop uitgeschakeld.',
        },
        view: {
          name: 'weergeven',
          description: 'Huidige configuratie weergeven',
          title: 'OFFHUNTER — Serverconfiguratie',
          footer: name => `Gebruik /${name} <subcommando> om een waarde te wijzigen.`,
          noConfig: 'Geen configuratie gevonden',
          noConfigDetail: (name, ch) => `Begin met \`/${name} ${ch}\`.`,
          fields: {
            channel:  'Kanaal',
            keywords: 'Zoektermen',
            schedule: 'Planning',
            zip:      'Postcode',
            retailers:'Winkels',
            maxPrice: 'Max. prijs',
            dealLink: 'Deallink',
            all:      'Alle',
            none:     'Geen limiet',
            enabled:  'Ingeschakeld',
            disabled: 'Uitgeschakeld',
          },
        },
        reset: {
          name: 'resetten',
          description: 'Alle serverconfiguratie wissen',
          success: 'Configuratie gewist.',
        },
      },
      errors: {
        serverOnly: { title: 'Alleen op servers',          detail: 'Dit commando kan alleen op een server worden gebruikt.' },
        noConfig:   { title: 'Geen configuratie gevonden', detail: (name, ch) => `Begin met \`/${name} ${ch}\`.` },
      },
    },
  },
  embeds: {
    deals: {
      noResults:       'Geen aanbiedingen gevonden. Probeer een andere zoekterm of pas je filters aan.',
      title:           (q, n) => `${q}  —  ${n} aanbieding${n !== 1 ? 'en' : ''} gevonden`,
      allRetailers:    'alle winkels',
      loyaltyRequired: 'loyaliteitskaart vereist',
      pageFooter:      (p, t) => `${p} / ${t}  ·  marktguru.de`,
    },
    errors: {
      fetchFailed:        { title: 'Aanbiedingen ophalen mislukt',  detail: 'De marktguru API is mogelijk tijdelijk niet beschikbaar. Probeer het over een moment opnieuw.' },
      interactionExpired: { title: 'Interactie verlopen',           detail: name => `Gebruik \`/${name}\` om opnieuw te zoeken.` },
      refreshFailed:      { title: 'Vernieuwen mislukt',            detail: 'Kon marktguru niet bereiken. Probeer opnieuw.' },
    },
  },
  buttons: {
    prev:     'Vorige',
    next:     'Volgende',
    refresh:  'Vernieuwen',
    viewDeal: 'Aanbieding bekijken',
  },
};

export default nl;
