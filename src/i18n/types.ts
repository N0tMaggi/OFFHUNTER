export interface ViewFields {
  channel: string;
  keywords: string;
  schedule: string;
  zip: string;
  retailers: string;
  maxPrice: string;
  dealLink: string;
  all: string;
  none: string;
  enabled: string;
  disabled: string;
}

export interface LocaleData {
  commands: {
    deals: {
      name: string;
      description: string;
      options: {
        query: string;
        zip: string;
        retailers: string;
        max_price: string;
      };
    };
    setup: {
      name: string;
      description: string;
      subs: {
        channel:   { name: string; description: string; optDesc: string; success: (id: string) => string };
        keywords:  { name: string; description: string; optDesc: string; success: (terms: string) => string };
        schedule:  { name: string; description: string; optDesc: string; success: (expr: string) => string; invalid: string };
        zip:       { name: string; description: string; optDesc: string; success: (code: string) => string };
        retailers: { name: string; description: string; optDesc: string; success: (val: string) => string; cleared: string };
        maxprice:  { name: string; description: string; optDesc: string; success: (val: string) => string; cleared: string };
        deallink:  { name: string; description: string; optDesc: string; enabled: string; disabled: string };
        view: {
          name: string;
          description: string;
          title: string;
          footer: (setupName: string) => string;
          noConfig: string;
          noConfigDetail: (setupName: string, channelSub: string) => string;
          fields: ViewFields;
        };
        reset: { name: string; description: string; success: string };
      };
      errors: {
        serverOnly: { title: string; detail: string };
        noConfig:   { title: string; detail: (setupName: string, channelSub: string) => string };
      };
    };
  };
  embeds: {
    deals: {
      noResults: string;
      title: (query: string, count: number) => string;
      allRetailers: string;
      loyaltyRequired: string;
      pageFooter: (page: number, total: number) => string;
    };
    errors: {
      fetchFailed:        { title: string; detail: string };
      interactionExpired: { title: string; detail: (dealsName: string) => string };
      refreshFailed:      { title: string; detail: string };
    };
  };
  buttons: {
    prev: string;
    next: string;
    refresh: string;
    viewDeal: string;
  };
}
