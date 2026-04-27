# Which Key Extension Icons

This directory contains the logo assets for the vscode-whichkey extension.

## Files

- `logo.svg` - Primary layered key design with question mark (recommended)
- `logo-alt.svg` - Alternative design with SPC key and cascading indicator
- `logo-minimal.svg` - Minimalist W+? design

## Generating PNG Icons

VSCode extensions require PNG icons. Convert the SVG to PNG at these sizes:

```bash
# Using Inkscape
inkscape logo.svg --export-filename=logo.png --export-width=128 --export-height=128

# Using ImageMagick
convert -background none logo.svg -resize 128x128 logo.png

# Using cairosvg (Python)
cairosvg logo.svg -o logo.png --output-width 128 --output-height 128
```

## Required Sizes

- `logo.png` - 128x128 (main icon referenced in package.json)
- `logo-48.png` - 48x48
- `logo-16.png` - 16x16 (marketplace listing)

## Design Rationale

The logo represents the "which-key" concept:
- **Layered keys**: Shows the cascading menu structure
- **Question mark**: Indicates the "which" discovery aspect
- **Color scheme**: Uses VSCode blue tones (#007acc, #4fc1ff)
- **Dark background**: Matches VSCode's default dark theme
