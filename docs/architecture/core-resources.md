# Core Engine Resources

The `P:/Core/` directory contains engine-level resource primitives — placeholder 3D models, textures, and system assets used by the Enfusion engine. Unlike the scripts and config data documented elsewhere, these are binary engine resources.

## Directory Structure

```
Core/
├── all/                  — Placeholder textures
├── compass/              — Compass 3D model
├── cursor/               — Cursor 3D models and textures
├── data/                 — Visual effect textures and fonts
│   └── fonts/            — Engine fonts
├── default/              — Default/reference 3D models
├── empty/                — Null/empty 3D model
├── gps/                  — GPS 3D model
├── notepad/              — Notepad 3D model
├── radio/                — Radio 3D model
├── rectangle/            — Rectangle shape
├── skyobject/            — Sky dome object
├── sphere/               — Sphere model
├── textures/             — Texture reference model
├── watch/                — Wristwatch 3D model
├── black_co.paa          — Black texture (307 B)
├── default_co.paa        — Default texture (133 B)
├── halfa_ca.paa          — Alpha/transparency texture (491 B)
├── texheaders.bin        — Binary texture header data (3 KB)
└── rap.txt               — Directory descriptor
```

## Descriptor

From `P:/Core/rap.txt`:

```ini
prefix=
product=
version=113224
```

The version number indicates which build of the engine these resources target.

## Resource Categories

### Placeholder/Reference Models

These are simple geometric shapes used as placeholders during development or as reference primitives:

| Model | Path | Size | Purpose |
|-------|------|------|---------|
| Default | `default/default.p3d` | 1 KB | Fallback/reference model |
| Plane | `default/plane.p3d` | 600 B | Flat plane reference |
| Empty | `empty/empty.p3d` | 487 B | Null model (no geometry) |
| Rectangle | `rectangle/rect.p3d` | 605 B | Rectangle shape |
| Sphere | `sphere/koule.p3d` | 5 KB | Sphere (Czech: "koule") |
| Sky Object | `skyobject/skyobject.p3d` | 10 KB | Sky dome mesh |

### UI Cursor Models

| Model | Path | Usage |
|-------|------|-------|
| Cursor | `cursor/cursor.p3d` | Standard mouse cursor |
| Force Arrow | `cursor/forcearrowmodel.p3d` | Interaction prompt arrow |
| Force Arrow (Bulldozer) | `cursor/forcearrowmodelbuld.p3d` | Editor-mode arrow variant |

Cursor textures:
- `cursor/data/cursor1_co.paa` — Cursor color texture
- `cursor/data/cursor2_ca.paa` — Cursor alpha channel
- `cursor/data/arrow_raw.paa` — Force arrow texture
- `cursor/data/forcearrow_co.paa` — Force arrow color

### In-Game Item Models

Reference 3D models for UI and world representation of abstract items:

| Item | Model | Notes |
|------|-------|-------|
| Compass | `compass/compass.p3d` | 2.9 KB |
| GPS | `gps/gps.p3d` | 2 KB |
| Notepad | `notepad/notepad.p3d` | 2 KB |
| Radio | `radio/radio.p3d` | 2 KB |
| Watch | `watch/watch.p3d` | 4.4 KB |

### Visual Effect Textures

From `Core/data/`:

| Texture | Size | Purpose |
|---------|------|---------|
| `godrays.paa` | — | God rays volumetric effect |
| `noise_raw.paa` | 9 MB | Large noise texture for various effects |
| `raindroplayernoise.paa` | — | Rain drop noise overlay |
| `raindrops_88.paa` | — | Rain drop pattern (88px) |
| `raindrops_8888.paa` | — | Rain drop pattern (8888px) |
| `raindropsground.paa` | — | Ground-level rain ripple |
| `raindropslayer.paa` | — | Rain drop layer composite |
| `ticonversion.paa` | — | Texture format conversion reference |
| `ticonversion.tga` | — | TGA source for texture conversion |

### Engine Fonts

From `Core/data/fonts/`:

| Font | Format | Usage |
|------|--------|-------|
| `lucidaconsoleb11` | `.paa` + `.fxy` | Console font (11px) |
| `lucidaconsoleb8` | `.paa` + `.fxy` | Console font (8px) |
| `tahomab16` | `.paa` + `.fxy` | UI body text (16px) |

The `.fxy` files are font metric definitions. The `.paa` files are the rendered glyph bitmaps.

### Base Textures

| Texture | Purpose |
|---------|---------|
| `black_co.paa` | Solid black (fallback/initialization) |
| `default_co.paa` | Default color texture (uninitialized) |
| `halfa_ca.paa` | Half-alpha texture (transparency testing) |

## Usage in Modding

The `Core/` directory is primarily an **engine resource** — mods typically don't modify or reference it directly. However:

- Placeholder models can be used as stand-ins during early development
- Fonts define the game's text rendering and can be extended
- The `texheaders.bin` contains texture format data needed when adding custom PAA textures
- The `rap.txt` version number helps identify the target engine build

## Related Documentation

- [Architecture Overview](./) — How engine resources relate to scripts and configs
- [Data Config](/data-config/) — Game object configuration in `DZ/`
