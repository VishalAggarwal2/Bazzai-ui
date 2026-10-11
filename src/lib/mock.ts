import type { Field } from "./data";

export type Opt = { value: string; hint?: string };
const o = (value: string, hint?: string): Opt => ({ value, hint });

/** Sample values shown when someone clicks an input. Keys are referenced as `suggest="productName"`. */
export const mock: Record<string, Opt[]> = {
  productName: [o("Ilkal Silk Saree, Indigo", "Sarees"), o("Maheshwari Dupatta, Marigold", "Dupattas"), o("Hand-block Table Runner", "Home"), o("Khadi Nehru Jacket", "Menswear")],
  price: [o("8400", "a silk saree"), o("2100", "a dupatta"), o("950", "a cushion cover")],
  comparePrice: [o("9800", "was"), o("2600", "was")],
  sku: [o("KT-SAR-015"), o("KT-DUP-031"), o("KT-HOM-022")],
  search: [o("saree", "Category"), o("KT-DUP", "SKU prefix"), o("silk", "Fabric")],
  orderSearch: [o("#2481", "Ananya Krishnan"), o("Zoya Khan", "Customer"), o("Jaipur", "City")],
  storeSearch: [o("kaveri", "Active"), o("pedal", "Domain pending"), o("trial", "Status")],
  qty: [o("8", "one carton"), o("20"), o("60", "a delivery")],
  storeName: [o("Marigold Home", "Home and living"), o("Dhaga & Co.", "Handloom fashion"), o("Roast Republic", "Coffee roaster"), o("Spoke & Wheel", "Cycles")],
  slug: [o("marigold"), o("dhaga-co"), o("roast-republic"), o("kaveri", "already taken")],
  domain: [o("shop.marigoldhome.in"), o("store.dhagaco.com"), o("buy.roastrepublic.in")],
  email: [o("neha@kaveritextiles.in", "Store manager"), o("farah@kaveritextiles.in", "Cashier"), o("imran@kaveritextiles.in", "Stock keeper"), o("priya@kaveritextiles.in", "Content editor")],
  shopperEmail: [o("ananya.k@gmail.com"), o("zoya.khan@outlook.com"), o("meghna@rao.in")],
  roleName: [o("Visual merchandiser", "Website and products"), o("Delivery lead", "Orders only"), o("Warehouse supervisor", "Inventory and transfers"), o("Finance reviewer", "Read-only reports")],
  tableName: [o("Size guides", "Per category"), o("Repair requests", "Linked to orders"), o("Wholesale leads", "Name, city, volume"), o("Store visits", "Date, branch, notes")],
  fieldLabel: [o("Order number", "Link to record"), o("Fabric batch", "Short text"), o("Customer city", "Short text"), o("Preferred size", "Choice"), o("Needs follow-up", "Yes / no")],
  fieldChoices: [o("Small, Medium, Large, XL"), o("Open, In review, Resolved"), o("Walk-in, WhatsApp, Instagram")],
  entityRecordText: [o("Colour looked deeper than the photo"), o("Needs a call back before Friday")],
  reviewTitle: [o("The border is unreal in person"), o("Softer than expected"), o("Fits true to size")],
  reviewBody: [o("Draped beautifully and the zari hasn't tarnished after three washes."), o("Colour is slightly deeper than the photos, which I love."), o("Arrived creased but a quick steam sorted it. Lovely weave.")],
  comment: [o("Staff helped me match a dupatta to my saree."), o("Checkout was quick. Wish there were more filters."), o("Reply on WhatsApp took a day.")],
  score: [o("10", "promoter"), o("8", "passive"), o("5", "detractor")],
  careNotes: [o("Dry clean first wash. Wash cold, line dry in shade."), o("Hand wash with mild soap. Do not wring.")],
  customer: [o("Ananya Krishnan", "Chennai"), o("Rahul Verma", "Bengaluru"), o("Zoya Khan", "Hyderabad")],
};

const section: Record<string, Record<string, Opt[]>> = {
  announcement: { text: [o("Free shipping across India on orders over ₹2,000"), o("Diwali edit is live. Order by 20 Oct for delivery before the festival"), o("Visit our new Jaipur flagship this weekend")] },
  hero: {
    headline: [o("Woven slowly, worn for years."), o("Diwali, drawn from the loom."), o("Thread by thread, since 1994.")],
    sub: [o("Handloom sarees and block-printed everyday wear, made by 140 weavers across Karnataka and Gujarat."), o("New colours, naturally dyed in small batches. Ships in 48 hours.")],
    cta: [o("Shop the Diwali edit"), o("Browse sarees"), o("See what's new")],
  },
  marquee: { text: [o("Handwoven · Naturally dyed · Ships in 48 hours · Easy 15-day returns"), o("Free alterations · Gift wrapping · Cash on delivery")] },
  collections: { headline: [o("Shop by category"), o("Find your fabric"), o("Start with a favourite")] },
  products: { headline: [o("Fresh off the loom"), o("Best sellers this week"), o("Ready to ship")] },
  story: {
    headline: [o("Forty looms. One family workshop."), o("Made by hands you can name.")],
    sub: [o("We started with two looms in Ilkal in 1994. Today every piece still passes through the same hands that dyed the thread."), o("Every saree carries the name of the weaver who made it.")],
  },
  reviews: { headline: [o("What customers say"), o("Loved by 2,000 customers"), o("In their words")] },
  feedback: { headline: [o("How are we doing?"), o("Help us get better")] },
  newsletter: { headline: [o("Be first to the loom"), o("New drops, first")], sub: [o("New drops, once a fortnight. Nothing else."), o("Early access to festival edits.")] },
};
export const builderSuggest = (type: string, key: string): Opt[] => section[type]?.[key] ?? [];

export function fieldSuggest(f: Field): Opt[] | undefined {
  const byKey: Record<string, string> = { title: "reviewTitle", body: "reviewBody", comment: "comment", score: "score", care: "careNotes", name: "productName", price: "price" };
  if (byKey[f.key]) return mock[byKey[f.key]];
  if (f.type === "email") return mock.shopperEmail;
  if (f.type === "longtext") return mock.entityRecordText;
  if (f.type === "text") return [o("Handloom, Ilkal"), o("Batch 24-10"), o("Follow up Monday")];
  return undefined;
}
