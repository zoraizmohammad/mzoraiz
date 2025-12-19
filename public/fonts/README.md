# Font Files

Place your font files in the following directories:

## ITC Garamond
Place ITC Garamond font files in `/public/fonts/garamond/`:
- `ITCGaramond-Regular.woff2` (required)
- `ITCGaramond-Italic.woff2` (optional)
- `ITCGaramond-Bold.woff2` (optional)

Supported formats: `.woff2`, `.woff`, `.ttf`, `.otf`

If font files are not available, the site will fall back to: Georgia, Times New Roman, serif

## Optima
Place Optima font files in `/public/fonts/optima/`:
- `Optima-Regular.woff2` (required)
- `Optima-Bold.woff2` (optional)

Supported formats: `.woff2`, `.woff`, `.ttf`, `.otf`

If font files are not available, the site will fall back to: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, sans-serif

## Note
The font loading is configured in `/lib/fonts.ts`. If you need to adjust file names or paths, update that file accordingly.

