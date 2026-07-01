import { defineConfig } from 'vitepress'
import { withMermaid } from "vitepress-plugin-mermaid"

// https://vitepress.dev/reference/site-config
export default withMermaid({
  mermaid: {
    // https://mermaid.js.org/config/setup/modules/mermaid.html
    theme: 'base',
    themeVariables: {
      darkMode: true,
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      fontSize: '14px',
      background: '#16181d',
      mainBkg: '#24282f',
      secondBkg: '#2d333b',
      tertiaryBkg: '#1f2329',
      primaryColor: '#24282f',
      primaryBorderColor: '#8b949e',
      primaryTextColor: '#f0f6fc',
      secondaryColor: '#2d333b',
      secondaryBorderColor: '#8b949e',
      secondaryTextColor: '#f0f6fc',
      tertiaryColor: '#1f2329',
      tertiaryBorderColor: '#8b949e',
      tertiaryTextColor: '#f0f6fc',
      lineColor: '#c9d1d9',
      textColor: '#f0f6fc',
      titleColor: '#f0f6fc',
      edgeLabelBackground: '#16181d',
      clusterBkg: '#30363d',
      clusterBorder: '#8b949e',
      nodeBorder: '#8b949e'
    },
    // https://mermaid.js.org/config/schema-docs/config.html
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      padding: 24,
      nodeSpacing: 70,
      rankSpacing: 80,
      curve: 'basis'
    }
  },
  title: "DayZ Scripts Wiki",
  description: "Comprehensive documentation of DayZ game scripts, architecture, and systems",
  lang: 'en-US',

  base: '/DayZ-Scripts-Wiki/',

  themeConfig: {
    logo: '/images/dayz-logo.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Architecture', link: '/architecture/' },
      { text: 'Script Layers', link: '/script-layers/' },
      { text: 'Game Systems', link: '/game-systems/' },
      { text: 'World Gameplay', link: '/world-gameplay/' },
      { text: 'Data Config', link: '/data-config/' },
      { text: 'Modding', link: '/modding/' },
    ],

    sidebar: {
      '/architecture/': [
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/architecture/' },
            { text: 'Layer System', link: '/architecture/layer-system' },
            { text: 'Entity Hierarchy', link: '/architecture/entity-hierarchy' },
            { text: 'Scripts vs Config', link: '/architecture/script-vs-config' },
            { text: 'Core Resources', link: '/architecture/core-resources' },
            { text: 'Auxiliary Directories', link: '/architecture/auxiliary-directories' },
          ]
        }
      ],
      '/script-layers/': [
        {
          text: 'Script Layers',
          items: [
            { text: 'Overview', link: '/script-layers/' },
            { text: 'Layer 1: Core', link: '/script-layers/1-core' },
            { text: 'Layer 2: Game Library', link: '/script-layers/2-gamelib' },
            { text: 'Layer 3: Game Logic', link: '/script-layers/3-game' },
            { text: 'Layer 4: World', link: '/script-layers/4-world' },
            { text: 'Layer 5: Mission', link: '/script-layers/5-mission' },
          ]
        }
      ],
      '/game-systems/': [
        {
          text: 'Game Systems',
          items: [
            { text: 'Overview', link: '/game-systems/' },
            { text: 'Player System', link: '/game-systems/player-system' },
            { text: 'Inventory System', link: '/game-systems/inventory-system' },
            { text: 'User Actions System', link: '/game-systems/user-actions-system' },
            { text: 'Weapons & Firearms', link: '/game-systems/weapons-system' },
            { text: 'Modifiers & Symptoms', link: '/game-systems/modifiers-symptoms-system' },
            { text: 'Damage & Combat', link: '/game-systems/damage-combat' },
            { text: 'Effect System', link: '/game-systems/effect-system' },
            { text: 'Weather & Environment', link: '/game-systems/weather-environment' },
            { text: 'AI System', link: '/game-systems/ai-system' },
            { text: 'Vehicle System', link: '/game-systems/vehicle-system' },
            { text: 'Animation System', link: '/game-systems/animation-system' },
            { text: 'Sound System', link: '/game-systems/sound-system' },
            { text: 'Voice Communication', link: '/game-systems/voice-communication' },
            { text: 'Networking & RPC', link: '/game-systems/networking' },
            { text: 'Persistence & Hive', link: '/game-systems/persistence-hive' },
            { text: 'Central Economy', link: '/game-systems/central-economy' },
            { text: 'Crafting & Cooking', link: '/game-systems/crafting-cooking-system' },
            { text: 'Base Building', link: '/game-systems/base-building-system' },
          ]
        }
      ],
      '/world-gameplay/': [
        {
          text: 'World Gameplay',
          items: [
            { text: 'Overview', link: '/world-gameplay/' },
            { text: 'Player Stats', link: '/world-gameplay/player-stats' },
            { text: 'Stamina System', link: '/world-gameplay/stamina' },
            { text: 'Soft Skills', link: '/world-gameplay/soft-skills' },
            { text: 'Crafting & Cooking', link: '/world-gameplay/crafting-cooking' },
            { text: 'Base Building', link: '/world-gameplay/base-building' },
            { text: 'Emotes', link: '/world-gameplay/emotes' },
            { text: 'Contaminated Areas', link: '/world-gameplay/contaminated-areas' },
            { text: 'Underground System', link: '/world-gameplay/underground' },
            { text: 'Food Stage System', link: '/world-gameplay/food-stages' },
          ]
        }
      ],
      '/data-config/': [
        {
          text: 'Data Config',
          items: [
            { text: 'Overview', link: '/data-config/' },
            { text: 'Gear & Items', link: '/data-config/gear-items' },
            { text: 'Weapons', link: '/data-config/weapons' },
            { text: 'Characters', link: '/data-config/characters' },
            { text: 'Vehicles', link: '/data-config/vehicles-data' },
            { text: 'Structures', link: '/data-config/structures' },
            { text: 'Worlds', link: '/data-config/worlds' },
            { text: 'Surfaces', link: '/data-config/surfaces' },
            { text: 'Animals', link: '/data-config/animals' },
            { text: 'Plants', link: '/data-config/plants' },
            { text: 'Rocks', link: '/data-config/rocks' },
            { text: 'Animation Data', link: '/data-config/animation-data' },
            { text: 'AI Config', link: '/data-config/ai-config' },
            { text: 'Sound Config', link: '/data-config/sounds-config' },
            { text: 'Sound Pipeline', link: '/data-config/sound-hierarchy' },
            { text: 'Territories', link: '/data-config/territories' },
            { text: 'UI Config', link: '/data-config/ui-config' },
            { text: 'config.cpp Guide', link: '/data-config/config-cpp-guide' },
          ]
        }
      ],
      '/modding/': [
        {
          text: 'Modding Guide',
          items: [
            { text: 'Overview', link: '/modding/' },
            { text: 'Mod Project Structure', link: '/modding/mod-structure' },
            { text: 'Client/Server Logic', link: '/modding/client-server-logic' },
            { text: 'Common APIs', link: '/modding/common-apis' },
            { text: 'Debugging', link: '/modding/debugging' },
            { text: 'Safe Modding Patterns', link: '/modding/safe-patterns' },
            { text: 'Real Mod Examples', link: '/modding/real-mod-examples' },
            { text: 'Enforce Script Syntax', link: '/modding/enforce-syntax' },
          ]
        }
      ],
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Welcome', link: '/' },
            { text: 'Architecture', link: '/architecture/' },
            { text: 'Script Layers', link: '/script-layers/' },
          ]
        },
        {
          text: 'Deep Dives',
          items: [
            { text: 'Game Systems', link: '/game-systems/' },
            { text: 'World Gameplay', link: '/world-gameplay/' },
            { text: 'Data Config', link: '/data-config/' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/bohemia-interactive/dayz' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Documentation for learning and reference purposes.',
      copyright: 'DayZ is a trademark of Bohemia Interactive.'
    }
  },

  head: [
    ['link', { rel: 'icon', href: '/images/favicon.png' }]
  ]
})
