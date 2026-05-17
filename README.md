# BioTrail

Smart Medical History Wallet — Landing-Page-MVP für das Lean Startup Bootcamp 2026, Frankfurt School of Finance & Management.

Dies ist die Smoke-Test-Landingpage im Buffer-Style: erklärt das Produkt, bietet zwei Tarife (Free/Premium), und misst Zahlungsbereitschaft über Email-Captures, die jeweils mit dem geklickten Plan getaggt sind.

---

## Tech-Stack

- **[Astro 4](https://astro.build)** — Static-First Framework mit serverlosen API-Routen für die Form-Verarbeitung
- **i18n nativ** — Routing für EN + DE; vorbereitet für TR, AR (RTL!), UK in Phase 2
- **[Resend](https://resend.com)** — Email-Backend für Signup-Notifications + Auto-Reply
- **[Plausible](https://plausible.io)** — DSGVO-konforme Analytics, perfekt für A/B-Test-Auswertung
- **[Vercel](https://vercel.com)** — Hosting, Serverless-Adapter

---

## Lokal starten (5 Minuten)

```bash
# 1. In das Projekt-Verzeichnis wechseln
cd biotrail

# 2. Dependencies installieren
npm install

# 3. .env anlegen (kannst du auch erstmal weglassen — siehe unten)
cp .env.example .env

# 4. Dev-Server starten
npm run dev
```

Browser öffnen auf `http://localhost:4321/en` (oder `/de`).

**Wichtig zum Dev-Modus:** Solange `RESEND_API_KEY` in `.env` nicht gesetzt ist, läuft `/api/capture` im Dev-Modus — Email-Captures werden in der Server-Konsole geloggt, nicht echt versendet. Das ist ideal, um die ganze Smoke-Test-Mechanik zu testen, bevor du echte Mails verschicken willst.

---

## Projektstruktur

```
biotrail/
├── astro.config.mjs           # i18n-Routing + Vercel-Adapter
├── package.json
├── tsconfig.json
├── .env.example               # Konfig-Vorlage (kopiere zu .env)
│
├── public/
│   └── favicon.svg            # SVG-Favicon mit BioTrail-Initiale
│
└── src/
    ├── i18n/
    │   ├── en.json            # ALLE englischen Texte
    │   ├── de.json            # ALLE deutschen Texte
    │   └── index.ts           # Loader + Locale-Helpers
    │
    ├── styles/
    │   └── global.css         # Design-Tokens + alle Section-Styles
    │
    ├── layouts/
    │   └── BaseLayout.astro   # <html>, <head>, Fonts, Plausible
    │
    ├── components/
    │   ├── Nav.astro          # Sticky-Nav mit Sprach-Switcher
    │   ├── Hero.astro         # Hero mit Stock-Foto + Quote-Badge
    │   ├── Sections.astro     # Strip + Problem + Solution + Pricing + About + CTA
    │   ├── Footer.astro
    │   └── Modal.astro        # Smoke-Test-Capture mit Submit-Logik
    │
    └── pages/
        ├── index.astro              # Redirect → /en
        ├── [lang]/index.astro       # Statisch generiert für jede Sprache
        └── api/capture.ts           # POST-Endpoint, Resend-Integration
```

---

## Wie der Smoke-Test funktioniert (das LSB-Herzstück)

1. **Besucher landet auf der Seite** (durch eine Google- oder Meta-Ads-Kampagne, die Day 3 vorschreibt)
2. **Besucher klickt einen CTA**: "Get Early Access" (Hero/Nav), "Start free" (Free-Plan), oder "Get Premium" (Premium-Plan)
3. **Modal öffnet sich** mit "We're launching Q1 2027" + Plan-Pille (zeigt was reserviert wird)
4. **Besucher gibt Email ein und submitted**
5. **Drei Dinge passieren gleichzeitig:**
   - `/api/capture` schickt zwei Resend-Mails: an euch (Notification) + an den Besucher (Auto-Reply)
   - Plausible feuert ein `signup`-Event mit `props: { plan, locale, source }`
   - Erfolgs-View ersetzt das Formular im Modal

**Die Plausible-Properties sind eure Datenbasis für die Demo-Day-Präsentation:**

- `plan: premium` vs `plan: free` → das ist eure **Zahlungsbereitschafts-Validierung**. Wenn 60% der Signups Premium klicken, hat das LSB-Modul-Frage „Will they pay you for it?" eine klare Antwort.
- `locale: de` vs `locale: en` → welche Sprachversion converted besser?
- `source: modal` vs `source: footer_cta` → wo im Funnel werden Leads gefangen?

---

## A/B-Tests einrichten

Plausible unterstützt Custom Properties direkt — keine separate A/B-Test-Tool nötig.

Beispiel: Du willst zwei Hero-Headlines testen. Setze in `src/i18n/en.json` zwei Varianten und pick zufällig:

```js
// In Hero.astro Frontmatter:
const variant = Math.random() < 0.5 ? 'A' : 'B';
const title = variant === 'A' ? dict.hero.title_a_v1 : dict.hero.title_a_v2;
```

Dann fügst du im Modal-Script `props: { variant }` hinzu — und im Plausible-Dashboard filterst du Signups nach Variante. Das ist genau die A/B-Mechanik aus Day 3.

---

## Deployment auf Vercel (10 Minuten)

```bash
# 1. Code zu GitHub pushen
git init
git add -A
git commit -m "BioTrail landing page MVP"
gh repo create biotrail --private --source=. --push

# 2. Auf vercel.com → Add New Project → Import dein GitHub-Repo
#    Vercel erkennt Astro automatisch.

# 3. Environment Variables in Vercel-Dashboard setzen
#    (dieselben wie in .env.example: RESEND_API_KEY, etc.)

# 4. Deploy → Vercel gibt dir eine *.vercel.app-URL
```

**Custom Domain anhängen:**

1. Im Vercel-Projekt → Settings → Domains → `biotrail.com` (oder `biotrail.de`) hinzufügen
2. Vercel zeigt dir DNS-Records (A oder CNAME)
3. Diese Records bei Cloudflare Registrar in DNS eintragen
4. Nach 1–5 Minuten ist die Domain live, automatisch mit SSL

---

## Resend einrichten (5 Minuten)

1. Account auf [resend.com](https://resend.com) — Free-Tier: 100 Mails/Tag, 3000/Monat
2. Domain hinzufügen + DNS-Records bei Cloudflare setzen (DKIM + SPF) — Resend zeigt sie an
3. API-Key generieren → in Vercel als `RESEND_API_KEY` setzen
4. `RESEND_NOTIFY_TO` auf eure Team-Adresse setzen
5. `RESEND_FROM` auf eine Adresse von eurer verifizierten Domain (z.B. `BioTrail <hello@biotrail.com>`)

**Alternative für super-schnellen Start:** [Formspree](https://formspree.io). Ersetze in `Modal.astro` die `fetch('/api/capture', ...)` durch ein POST an deine Formspree-URL. Funktioniert ohne Backend, kein Code-Server nötig. Nachteil: keine Custom-Auto-Reply.

---

## Plausible einrichten (3 Minuten)

1. Account auf [plausible.io](https://plausible.io) — 30 Tage Free-Trial, danach ~9€/Monat
2. Domain hinzufügen
3. In Vercel `PUBLIC_PLAUSIBLE_DOMAIN=biotrail.com` setzen
4. Script lädt sich automatisch via `BaseLayout.astro`

**Conversion Goals einrichten in Plausible:**

- Goal: `modal_open` — wie viele klicken überhaupt einen CTA?
- Goal: `signup` — wie viele submitten?
- Conversion Rate = `signup / modal_open` (Funnel-Bottom)
- Filter nach Custom Property `plan = premium` → Zahlungsbereitschafts-Conversion

---

## Eine neue Sprache hinzufügen (z.B. Türkisch)

1. `src/i18n/tr.json` erstellen — Struktur von `en.json` kopieren, alle Werte übersetzen lassen
2. In `src/i18n/index.ts`:
   ```ts
   import tr from './tr.json';
   export const LOCALES = ['en', 'de', 'tr'] as const;
   const dictionaries = { en, de, tr };
   ```
3. Aus `SOON_LOCALES` rausnehmen
4. `npm run build` — Astro generiert automatisch `/tr/` und der Sprach-Switcher zeigt sie als live

Für Arabisch (`ar`): zusätzlich in `RTL_LOCALES` aufnehmen. Layout passt sich automatisch an (siehe `html[dir="rtl"]`-Regeln in `global.css`).

---

## Was als Nächstes (Bootcamp-Roadmap)

- [ ] Domain bei Cloudflare Registrar kaufen
- [ ] Repo auf GitHub pushen
- [ ] Auf Vercel deployen + Domain anschließen
- [ ] Resend-Account + DNS + API-Key
- [ ] Plausible-Account + Custom Goals einrichten
- [ ] Erste Google-Ads-Kampagne (max 50 € Budget für ersten CAC-Datenpunkt)
- [ ] Erste Meta-Ads-Kampagne mit gleichem Budget (zum Vergleichen)
- [ ] 7–10 Tage laufen lassen, dann Plausible auswerten → Demo-Day-Slides

---

Built in Frankfurt, May 2026.
