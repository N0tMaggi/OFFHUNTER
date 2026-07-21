import { LocaleData } from './types.js';

const en: LocaleData = {
  commands: {
    deals: {
      name: 'deals',
      description: 'Search for deals on marktguru.de',
      options: {
        query:    'Search term, e.g. "Red Bull"',
        zip:      'German postal code (default: server setting)',
        retailers:'Comma-separated retailer filter, e.g. "lidl,rewe"',
        max_price:'Maximum price in €',
      },
    },
    setup: {
      name: 'setup',
      description: 'Configure OFFHUNTER for this server',
      subs: {
        channel: {
          name: 'channel',
          description: 'Set the channel for automatic deal posts',
          optDesc: 'Target channel',
          success: id => `Channel set to <#${id}>.`,
        },
        keywords: {
          name: 'keywords',
          description: 'Set search keywords (comma-separated)',
          optDesc: 'e.g. "energy drink, red bull"',
          success: terms => `Keywords updated to \`${terms}\`.`,
        },
        schedule: {
          name: 'schedule',
          description: 'Set posting schedule as a cron expression',
          optDesc: 'e.g. "0 8 * * *" = daily at 8am',
          success: expr => `Schedule updated to \`${expr}\`.`,
          invalid: 'Example: `0 8 * * *` (daily at 8am)\nMore help: https://crontab.guru',
        },
        zip: {
          name: 'zip',
          description: 'Set the postal code for deal searches',
          optDesc: 'German postal code, e.g. 10115',
          success: code => `Postal code set to \`${code}\`.`,
        },
        retailers: {
          name: 'retailers',
          description: 'Filter deals by retailer (comma-separated, leave empty for all)',
          optDesc: 'e.g. "lidl, rewe, aldi-sued"',
          success: val => `Retailer filter set to \`${val}\`.`,
          cleared: 'Retailer filter cleared (all retailers).',
        },
        maxprice: {
          name: 'maxprice',
          description: 'Set a maximum deal price in € (0 = no limit)',
          optDesc: 'Price in €',
          success: val => `Max price set to \`${val} €\`.`,
          cleared: 'Max price limit removed.',
        },
        deallink: {
          name: 'deallink',
          description: 'Show or hide the external deal link button on results',
          optDesc: 'Enable deal link button',
          enabled: 'Deal link button enabled.',
          disabled: 'Deal link button disabled.',
        },
        view: {
          name: 'view',
          description: 'Show current configuration',
          title: 'OFFHUNTER — Server Configuration',
          footer: name => `Use /${name} <subcommand> to change any value.`,
          noConfig: 'No configuration found',
          noConfigDetail: (name, ch) => `Start with \`/${name} ${ch}\` to get going.`,
          fields: {
            channel:  'Channel',
            keywords: 'Keywords',
            schedule: 'Schedule',
            zip:      'Postal code',
            retailers:'Retailers',
            maxPrice: 'Max price',
            dealLink: 'Deal link',
            all:      'All',
            none:     'None',
            enabled:  'Enabled',
            disabled: 'Disabled',
          },
        },
        reset: {
          name: 'reset',
          description: 'Clear all server configuration',
          success: 'Configuration cleared.',
        },
      },
      errors: {
        serverOnly: { title: 'Server only',            detail: 'This command can only be used in a server.' },
        noConfig:   { title: 'No configuration found', detail: (name, ch) => `Start with \`/${name} ${ch}\` first.` },
      },
    },
  },
  embeds: {
    deals: {
      noResults:       'No deals found. Try a different keyword or adjust your filters.',
      title:           (q, n) => `${q}  —  ${n} deal${n !== 1 ? 's' : ''} found`,
      allRetailers:    'all retailers',
      loyaltyRequired: 'loyalty card required',
      pageFooter:      (p, t) => `${p} / ${t}  ·  marktguru.de`,
    },
    errors: {
      fetchFailed:        { title: 'Failed to fetch deals',  detail: 'The marktguru API may be temporarily unavailable. Try again in a moment.' },
      interactionExpired: { title: 'Interaction expired',    detail: name => `Use \`/${name}\` to search again.` },
      refreshFailed:      { title: 'Refresh failed',         detail: 'Could not reach marktguru. Try again.' },
    },
  },
  buttons: {
    prev:     'Prev',
    next:     'Next',
    refresh:  'Refresh',
    viewDeal: 'View Deal',
  },
};

export default en;
