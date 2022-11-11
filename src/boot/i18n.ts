import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';

import messages from 'src/i18n';
import { Quasar } from 'quasar';
import es from 'quasar/lang/es';

export default boot(({ app }) => {
  Quasar.lang.set(es);
  const numberFormats = {
    es: {
      currency: {
        style: 'currency',
        currency: 'EUR',
        currencyDisplay: 'symbol',
      },
    },
  };
  const i18n = createI18n({
    locale: 'es',
    messages,
    numberFormats,
  });

  // Set i18n instance on app
  app.use(i18n);
});
