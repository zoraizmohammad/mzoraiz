// Font configuration for Next.js
// This file provides CSS variable names for font families
// Actual font loading is handled via @font-face in globals.css
// This allows the site to work even if font files don't exist yet

// CSS variable names for font families
// These will be set in globals.css via @font-face or fallback to system fonts
export const fontVariables = {
  garamond: "--font-garamond",
  optima: "--font-optima",
};

// Placeholder font objects that provide the CSS variable names
// without requiring the font files to exist at build time
export const garamond = {
  variable: fontVariables.garamond,
  className: "",
};

export const optima = {
  variable: fontVariables.optima,
  className: "",
};
