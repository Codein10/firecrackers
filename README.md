# Your Brand Fireworks — Website (demo)

A 12-page fireworks shop website: home, product listings, product details, cart,
combo boxes (with a "build your own box" tool), festival offers with a live
Diwali countdown, bulk/dealer orders, gallery, and contact.

## How to open it

**Quick look:** double-click `index.html` and it opens in your browser.

**Best way (behaves exactly like a real website):** run a small local server
inside this folder:

```
python -m http.server 8000
```

then open http://localhost:8000 in your browser.

## How to put it online

It is a plain static website, so no database or server code is needed. You can
upload the whole folder as it is to any normal web host:

- Hostinger, GoDaddy or any cPanel host: upload everything into `public_html`
- Netlify: drag and drop the folder onto app.netlify.com/drop
- GitHub Pages or Vercel also work

Keep the folder structure the same (`assets/`, `js/` and the `.html` files
side by side).

## Folder structure

| Path | What it is |
|---|---|
| `index.html` | Home page |
| `category.html` | All products (filters + sort) |
| `newarrivals.html`, `eliteseries.html`, `fountains.html` | The same product page, opened on that filter |
| `product.html` | Product details |
| `cart.html` | Cart + order enquiry |
| `combos.html` | Ready combo boxes + build-your-own box |
| `offers.html` | Festival offers + live countdown |
| `bulk.html` | Bulk orders & dealer registration |
| `gallery.html` | Photo/video gallery with full-screen viewer |
| `contact.html` | Contact cards, map link, opening hours, form |
| `assets/images/`, `assets/video/` | All photos and the banner video |
| `js/fw-runtime.js` | Small engine that draws each page from its template |
| `js/react*.js` | React 18, bundled so the site works offline |
| `design-source/` | Original design files from the Claude design canvas, for reference |

## How to edit text, prices and products

Each `.html` page has two parts:

1. **`<template id="fw-template">`** holds the page layout and most of the text.
   Edit the words directly. Anything written like `{{brand}}` or `{{p.name}}` is
   filled in automatically, so don't delete those.
2. **`<script type="text/x-fw-logic">`** holds the data and behaviour: product
   lists, prices, FAQ answers, combo boxes, offers, festival dates and so on.
   Look for arrays like `const all = [ { name: ..., price: ... } ]`.

**Brand name and colour:** search for `'Your Brand'` and `'#E3112F'` across the
files and replace them with your own.

**The cart** is saved in the visitor's browser (localStorage), so it stays
filled while they move between pages.

## Still to do before launch

- [ ] **Brand:** replace "Your Brand" and the star logo with your name and logo.
- [ ] **Contact details:** fill in phone, WhatsApp number, email, address and
      opening hours (shown in `[brackets]`).
- [ ] **Products:** put in your real product names, pack sizes and prices. The
      prices are currently sample values.
- [ ] **Offers:** set your real offers and codes in `offers.html`.
- [ ] **Dealer terms:** fill in minimum order and delivery areas in `bulk.html`.
- [ ] **Journey years:** add the missing [Year] milestones on the home page.
- [ ] **Reviews:** replace the "SAMPLE REVIEW" cards with real customer reviews.
- [ ] **Photos and video:** replace the watermarked or third-party images:
      - `sky-rockets.png` (Alamy watermark)
      - `colour-fountain.png` (Dreamstime watermark)
      - `flower-pot-candles.png` (shows another brand's packaging)
      - `hero-banner.mp4` (iStock watermark)
      - check the licence of `rockets-illustration.png`
- [ ] **Forms:** connect the forms so they actually send. They show a
      thank-you message but don't deliver enquiries yet. Easy options are
      Formspree, a Google Sheet (via Apps Script), or opening a WhatsApp chat
      with the message pre-filled.
- [ ] **WhatsApp button:** point it at `https://wa.me/91XXXXXXXXXX`.
- [ ] **Price list:** link the "Download PDF" buttons to your price-list file.
