# Figma to HTML/CSS Converter

This project exports UI designs from a Figma file into static, browser-renderable HTML and CSS.  
It was built as part of the Softlight Engineering take-home assignment.

---

## Overview

The purpose of this project is to:

- Load frames, text nodes, rectangles, and styles from a Figma document using the Figma REST API
- Preserve layout, spacing, borders, shadows, corner radii, gradients, and text styles
- Serialize a nested HTML structure paired with clean CSS
- Produce output that opens in a browser without frameworks

The conversion pipeline:

1. Fetches the Figma document JSON
2. Maps nodes into a typed format (frames, texts, rectangles)
3. Recursively builds nested HTML
4. Generates corresponding CSS for layout and visual styles
5. Writes the result into output files

---

## Implementation Details

The solution supports:

- Input fields composed of multiple rectangles and text layers
- Auto layout frames rendered as flex layouts
- Individual corner radii per rectangle
- Gradient backgrounds using `linear-gradient()`
- SVG-like shadows using CSS `box-shadow`
- Stroke and fill mapping using CSS border + rgba()

Special handling was implemented for:

- Two-rect input boxes (Email/Password groups)
- Nested Figma auto-layout components
- Center-align and color normalization for text like "Forgot password"

---

## Running the Project

### Dependencies
Node.js and npm are required.

Install dependencies:

```bash
npm install
