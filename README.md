# DayZ Scripts Wiki

> Comprehensive, cross-referenced documentation of DayZ game scripts — built for **modders** and **AI coding agents**.

This wiki documents the Enforce Script source code, config data, and system architecture found in a standard DayZ game installation. It bridges the gap between raw game files and a browsable, searchable reference that both humans and automation tools can navigate efficiently.

## Purpose

DayZ's codebase is large and layered: 150+ script files across 5 layers, thousands of `config.cpp` definitions, and deeply interconnected systems. This wiki exists to:

- **Give modders a structured entrypoint** — understand the architecture before diving into raw source
- **Provide an agent-friendly reference** — AI agents can be pointed here for grounded, consistent context instead of hallucinating DayZ internals
- **Cross-reference everything** — every page links to related systems so you can trace how components interact
- **A document the separation of data and logic** — clarifying what lives in Enforce Script (`.c`) vs. config data (`config.cpp`)

## What's Documented

| Section | Covers |
|---------|--------|
| [Architecture](docs/architecture/) | 5-layer script system, entity class hierarchy, scripts vs. config data, key design principles |
| [Script Layers](docs/script-layers/) | Deep dive into each layer: `1_core` → `2_gamelib` → `3_game` → `4_world` → `5_mission` |
| [Game Systems](docs/game-systems/) | Player, inventory, damage/combat, effects, weather, AI, vehicles, animation, sound, networking, persistence |
| [World Gameplay](docs/world-gameplay/) | Player stats, stamina, soft skills, crafting/cooking, base building, emotes, contaminated areas, underground |
| [Data Config](docs/data-config/) | `config.cpp` definitions for gear, weapons, characters, vehicles, structures, and worlds |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed

### Run the Dev Server

```bash
npm install
npm run docs:dev
```

This starts a local VitePress dev server — typically at `http://localhost:5173` — with hot-reload as you edit markdown files.

### Build Static Site

```bash
npm run docs:build
npm run docs:preview
```

### Deploy to GitHub Pages

A [GitHub Actions workflow](.github/workflows/deploy.yml) is included to build and deploy the site automatically whenever changes are pushed to `main`.

To enable it:

1. Go to your repo **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Push to `main` — the workflow will build the site and deploy it to `https://<user>.github.io/DayZ-Scripts-Wiki/`

To deploy manually, trigger the workflow from the **Actions** tab using the **Run workflow** button.

## Project Structure

```
├── docs/
│   ├── .vitepress/
│   │   ├── config.mjs           # VitePress configuration (nav, sidebar, theme)
│   │   └── dist/                # Built static output
│   ├── architecture/            # System architecture docs
│   │   ├── index.md
│   │   ├── layer-system.md
│   │   ├── entity-hierarchy.md
│   │   └── script-vs-config.md
│   ├── script-layers/           # Per-layer deep dives
│   │   ├── index.md
│   │   ├── 1-core.md
│   │   ├── 2-gamelib.md
│   │   ├── 3-game.md
│   │   ├── 4-world.md
│   │   └── 5-mission.md
│   ├── game-systems/            # Core game subsystems
│   ├── world-gameplay/          # World simulation & player mechanics
│   ├── data-config/             # Config data reference
│   └── index.md                 # Home page
├── package.json
└── README.md
```

## For AI Agents

This wiki is designed to be consumed by AI coding agents. Each page:

- Uses **clear section headers** for targeted retrieval
- Contains **Mermaid diagrams** for architecture and hierarchy (rendered inline in VitePress)
- Provides **concrete code examples** showing real Enforce Script and config.cpp syntax
- Links to **related systems** to support multi-hop queries

When an agent needs DayZ context, point it here — the content is curated, grounded, and avoids the hallucinations common with LLMs guessing at game internals.

## Contributing

Contributions welcome! Whether you're fixing a typo, adding a missing system, or improving cross-references:

1. Fork the repository
2. Create a feature branch
3. Edit the relevant markdown file under `docs/`
4. Run `npm run docs:dev` to preview your changes
5. Submit a pull request

### Style Guidelines

- Use **active voice** and **present tense**
- Keep code examples **short and focused** — prefer snippets over large blocks
- Link to **related pages** at the bottom of each page
- Add **Mermaid diagrams** for structural or flow concepts
- Match the existing **heading hierarchy** (H1 = page title, H2 = sections, H3 = subsections)

## Disclaimer

This repository is **automatically generated and maintained by an AI agent**. While every effort is made to ensure accuracy, the content may contain errors, omissions, or interpretations that differ from the official DayZ source. Cross-reference with the actual game files when precision matters.

## License

Documentation content is provided for learning and reference purposes.

DayZ is a trademark of **Bohemia Interactive**.
