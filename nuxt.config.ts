// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'ko' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Pretendard:wght@400;500;600&display=swap'
        }
      ],
      script: [
        {
          // Apply persisted theme/density/accent before Vue hydrates to avoid FOUC.
          innerHTML: `(function(){try{var r=document.documentElement;var t=localStorage.getItem('tt-tweaks');if(t){var p=JSON.parse(t);if(p.theme==='light'||p.theme==='dark')r.setAttribute('data-theme',p.theme);if(p.density==='compact'||p.density==='default'||p.density==='spacious')r.setAttribute('data-density',p.density);if(typeof p.accent==='string'){r.style.setProperty('--accent',p.accent);r.style.setProperty('--accent-hover',p.accent);r.style.setProperty('--accent-soft',p.accent+'14');r.style.setProperty('--accent-border',p.accent+'40');}}}catch(e){}})();`,
          tagPosition: 'head'
        }
      ]
    }
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'json5',
        'fast-xml-parser',
        'yaml',
        'crypto-js', // CJS
      ]
    }
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    preset: 'static'
  }
})
