# UI Configuration

The `DZ/ui/` directory defines interface configuration — video quality presets and supported languages. From `P:/DZ/ui/config.cpp` (~207 lines).

## Video Options

`CfgVideoOptions` defines graphics quality presets:

### Preset Hierarchy

```
OverallSettings
├── OverallSettingsPC       — PC quality presets (5 levels)
└── OverallSettingsConsole  — Console base
    ├── OverallSettingsPS4      — PlayStation 4
    └── OverallSettingsXBOXONE  — Xbox One
```

### PC Quality Presets

`OverallSettingsPC` defines 5 presets: `VeryLow`, `Low`, `Normal`, `High`, `VeryHigh`:

```cpp
class Normal : OverallSettingsPC
{
    Visibility = 2;                // Object visibility range
    ObjectsVisibility = 2;         // Object count/detail
    ObjectDetail = 2;              // LOD quality
    TerrainDetail = 2;             // Terrain tessellation
    TextureDetail = 2;             // Texture resolution
    CloudsDetail = 2;              // Cloud rendering
    ShadowDetail = 2;              // Shadow resolution
    WaterDetail = 1;               // Water quality
    TextureFiltering = 1;          // Anisotropic filtering
    TerrainSurface = 2;            // Terrain material quality
    FXAA = 2;                      // Anti-aliasing
    MSAA = 1;                      // Multisample AA
    ATOC = 0;                      // Alpha-to-coverage
    FXAO = 2;                      // Ambient occlusion
    FXQuality = 1;                 // Post-process quality
};
```

### Preset Comparison

| Setting | VeryLow | Low | Normal | High | VeryHigh |
|---------|---------|-----|--------|------|----------|
| Visibility | 0 | 1 | 2 | 3 | 3 |
| ObjectsVisibility | 0 | 1 | 2 | 3 | 3 |
| ObjectDetail | 0 | 1 | 2 | 3 | 4 |
| TerrainDetail | 2 | 2 | 2 | 2 | 2 |
| TextureDetail | 0 | 1 | 2 | 3 | 4 |
| CloudsDetail | 0 | 1 | 2 | 3 | 4 |
| ShadowDetail | 0 | 1 | 2 | 3 | 4 |
| WaterDetail | 0 | 1 | 1 | 2 | 2 |
| TextureFiltering | 0 | 1 | 1 | 2 | 2 |
| TerrainSurface | 0 | 1 | 2 | 3 | 3 |
| FXAA | 0 | 1 | 2 | 3 | 4 |
| MSAA | 0 | 1 | 1 | 1 | 3 |
| ATOC | 0 | 0 | 0 | 0 | 1 |
| FXAO | 0 | 1 | 2 | 3 | 4 |
| FXQuality | 0 | 0 | 1 | 2 | 2 |

Values range 0 (lowest/off) to N (highest), varying per setting.

## Supported Languages

`CfgLanguages` defines the 13 supported game languages:

```cpp
class English
{
    name = "#options_language_english";
};

class French   { name = "#options_language_french"; };
class Spanish  { name = "#options_language_spanish"; };
class Italian  { name = "#options_language_italian"; };
class German   { name = "#options_language_german"; };
class Czech    { name = "#options_language_czech"; };
class Russian  { name = "#options_language_russian"; };
class Chinese  { name = "#options_language_chinese"; };
class Chinesesimp { name = "#options_language_chinesesimp"; };
class Polish   { name = "#options_language_polish"; };
class Japanese { name = "#options_language_japanese"; };
class Portuguese { name = "#options_language_portuguese"; };
```

| Language | Locale | Notes |
|----------|--------|-------|
| English | en | Default |
| French | fr | |
| Spanish | es | |
| Italian | it | |
| German | de | |
| Czech | cs | |
| Russian | ru | |
| Chinese | zh | Traditional |
| Chinese (Simplified) | zh_CN | Simplified |
| Polish | pl | |
| Japanese | ja | |
| Portuguese | pt | |

String table entries (`#options_language_*`) are defined in `P:/languagecore/stringtable.csv`.

## Related Documentation

- [5_mission GUI](/script-layers/5-mission) — Script-side UI implementation
- [Config System Guide](./config-cpp-guide) — General config file format
