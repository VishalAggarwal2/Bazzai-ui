# Bazzar UI (phase 1 mockup)

Front-end only mockup of the multi-tenant store platform. No backend: all data is sample data in `src/lib/data.ts`, and interactive state lives in Zustand stores (`src/lib/store.ts` for the manager, `src/lib/site-store.ts` for the website builder), so it resets on refresh.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Screens

| Route | What it shows |
| --- | --- |
| `/` | Project flow map and a live "host to tenant" resolver |
| `/onboarding` | Store signup wizard with live preview |
| `/platform` | Platform admin: all tenants, domains, plans |
| `/manager` | Store dashboard (tenant switcher, ⌘K palette) |
| `/manager/products` | Products with category tree, custom columns, product sheet, bulk edit |
| `/manager/inventory`, `/orders` | Core commerce screens |
| `/manager/entities` | Your own tables: 18 field types, links between tables (with lookups and rollups), a links map, templates, table / board / gallery views, approval flow, website entries |
| `/manager/people` | Org chart (drag to re-parent), list, teams, profile sheet, per-person overrides |
| `/manager/roles` | Role permission matrix with inheritance, limits and special permissions |
| `/manager/site` | Website builder (see below) |
| `/manager/settings` | Custom domain connect flow, plan and usage |
| `/store` | The public storefront, driven by the published builder document |

## Website builder

- Every text is editable in place on the canvas: logo, menu items, headings, paragraphs, buttons, badges, stats, footer links.
- Drag anything: elements between columns, whole sections, from the canvas, the Layers panel, or the Add panel (new sections and elements).
- Page > Section > Column > Element model, with column ratios, alignment, spacing, backgrounds, fonts, colours, per-device visibility (desktop / tablet / mobile).
- Theme presets, 8 font pairs, colour tokens, header options, multiple pages, home page switch.
- Undo / redo (⌘Z, ⇧⌘Z), duplicate (⌘D), delete, zoom and fit, Preview, Publish and Discard.

## Custom data: links between tables

- **Link to table** fields point at your other tables or at built-in products, orders and team members, as one or many. Pick records from a searchable list, or create one on the spot.
- The other side sees it automatically: open a customer and you get "Reviews" and "Warranty claims" lists. Chips jump straight to the linked record.
- **Lookup** shows a value from a linked record (a review's fabric, from its product). **Rollup** counts, sums or averages linked records (a customer's lifetime spend, a weaver's piece count).
- **Links map** draws every relation. **Link two tables** creates one without touching field settings.
- Deleting a record removes links to it everywhere.

## Website builder: customise everything, in reach of everyone

- **Every element** has Content, Style and Advanced tabs: fill or gradient, four-sided padding, border, corners, shadow, hover lift/grow/glow, entrance animation with delay, tilt, a separate text size for phones, anchor id, screen reader label and custom CSS. Copy a style from one element and paste it on another, or reset it.
- **Every section**: gradient or photo background (upload or web address) with darken and fixed-scroll options, top and bottom lines, shadow, phone padding, entrance, anchor, custom CSS, and "Save to My sections" for reuse.
- **Header**: announcement bar, logo image, dropdown menus, header button, social links, text colour and nav type controls, working phone menu. **Pages**: background, hide header/footer, share image, no-index. **Theme**: saved colours, heading and button weight, card shadow, focus ring colour, underline links, reduce motion, site-wide CSS.
- **Easier**: ⌘K command palette (add, jump to any layer, switch view, publish), searchable Add panel, copy/cut/paste for elements and sections, Alt+arrows to move, Esc selects the parent, outlines toggle, version history with restore, tips bar and a shortcuts sheet (press `/`).
- **Accessible**: a Checks tab audits contrast, image descriptions, heading order, vague link text, tiny text and page titles, with one-click fixes. Colour pickers show live contrast ratios. The canvas is keyboard-navigable with a live announcer, and the storefront has a skip link, landmarks, visible focus rings, a pausable ticker and reduced-motion support.

## Website builder: forms and data lists

- **Form** element: pick a table, choose and reorder its fields, rename them on the page, mark required or half width, show a number as a 0 to 10 scale, add a new field to the table without leaving the builder. Submissions become real records (try it in Preview, then open Custom data). Tables with "Approve before publishing" hold new entries until a person approves them.
- **Data list** element: show any public table as cards, quotes, list, table or accordion. Map title, body, stars and a cover photo taken from a linked product; add visitor search and filter chips; sort, filter by value, show more.
- Tables control this with **Show on your website** (read) and **Accept website entries** (write).

## Sample data helpers

Click almost any input and a small panel offers realistic sample values. Turn this off with the "Sample data" switch in the header. Values live in `src/lib/mock.ts`. In the manager, a "Flow guide" card suggests what to try on each screen and which screen comes next.

## Stack

Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui components (Radix, in `src/components/ui`), motion, Zustand, cmdk, sonner, lucide-react, Fontsource fonts for the builder.

The shadcn components were written by hand in the standard shadcn pattern. To sync with the registry later run `npx shadcn@latest add <component>` (components.json is already set up).
# Bazzai-ui
