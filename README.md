# Prakash Rajendran · personal website

Personal website of **Prakash Rajendran**, an entry-level software developer from
Thanjavur, India. Live at **https://prakashrajendran1779.github.io/**.

Plain HTML, CSS and vanilla JavaScript: no build step, no frameworks, no trackers.

## Highlights

- **Interactive console:** the intro has a small JavaScript-style console. Try
  `prakash.skills`, `prakash.projects[0]`, `prakash.contact()` or `help`
  (Tab completes, ↑/↓ browse history). It never evaluates code; it only
  understands a fixed set of commands (`assets/js/console.js`).
- **Résumé download:** `assets/Prakash-Rajendran-Resume.pdf` is generated from
  this page's print stylesheet, so it always matches the site and contains only
  what the site shows.
- Light and dark themes, a responsive layout, keyboard and screen-reader
  support, and it respects `prefers-reduced-motion`.

## Structure

```
index.html                          page content (all sections)
404.html                            custom "page is not defined" error page
assets/css/styles.css               design tokens (colors, type, spacing), styles, print résumé layout
assets/js/main.js                   theme, header/menu, scroll reveals, scrollspy, copy email
assets/js/console.js                the interactive console and the data behind it
assets/img/                         favicon, touch icon, social preview image
assets/Prakash-Rajendran-Resume.pdf résumé generated from index.html
```

## Editing

- **Text and sections:** edit `index.html`.
- **Console answers:** edit the `prakash` object at the top of `assets/js/console.js`.
- **Colors and fonts:** change the tokens at the top of `assets/css/styles.css`.

## Regenerating the résumé PDF

After changing the content, regenerate the PDF from the page itself:

```sh
google-chrome --headless --no-pdf-header-footer \
  --print-to-pdf=assets/Prakash-Rajendran-Resume.pdf index.html
```

Or open the site in Chrome, choose **Print → Save as PDF** and turn off headers and footers.

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

## Deploy

Pushing to `main` publishes the site with GitHub Pages.

Fonts: Google Sans Flex and Google Sans Code (Google Fonts). Icons: Material Symbols (Apache 2.0).
