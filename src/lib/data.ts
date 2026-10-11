export const ROOT_DOMAIN = "bazzar.app";

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  domainStatus: "live" | "pending" | "none";
  plan: "Starter" | "Growth" | "Scale";
  status: "active" | "trial" | "suspended";
  mrr: number;
  products: number;
  city: string;
  color: string;
  since: string;
};

export const tenants: Tenant[] = [
  { id: "t1", name: "Kaveri Textiles", slug: "kaveri", domain: "shop.kaveritextiles.in", domainStatus: "live", plan: "Scale", status: "active", mrr: 24900, products: 412, city: "Bengaluru", color: "#3340ff", since: "Mar 2026" },
  { id: "t2", name: "Nila Coffee Roasters", slug: "nila", domain: "nilacoffee.com", domainStatus: "live", plan: "Growth", status: "active", mrr: 9900, products: 64, city: "Coorg", color: "#1f7a4d", since: "May 2026" },
  { id: "t3", name: "Pedal & Co.", slug: "pedal", domain: "pedal.cycles", domainStatus: "pending", plan: "Growth", status: "active", mrr: 9900, products: 188, city: "Pune", color: "#f0452b", since: "Jun 2026" },
  { id: "t4", name: "Haat Spices", slug: "haat", domainStatus: "none", plan: "Starter", status: "trial", mrr: 0, products: 31, city: "Kochi", color: "#e08a00", since: "Oct 2026" },
  { id: "t5", name: "Blue Lotus Home", slug: "bluelotus", domain: "bluelotus.home", domainStatus: "live", plan: "Scale", status: "active", mrr: 24900, products: 903, city: "Jaipur", color: "#7a3cff", since: "Jan 2026" },
  { id: "t6", name: "Dhaga Studio", slug: "dhaga", domainStatus: "none", plan: "Starter", status: "suspended", mrr: 0, products: 12, city: "Kolkata", color: "#888fb0", since: "Aug 2026" },
];

export type Pattern = "stripes" | "dots" | "checks" | "waves" | "diamond";
export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  compare?: number;
  stock: number;
  reorder: number;
  status: "active" | "draft" | "archived";
  tone: [string, string];
  pattern: Pattern;
  sold: number;
  categoryId: string;
  description: string;
  tags: string[];
  featured?: boolean;
  options: { name: string; values: string[] }[];
  custom: Record<string, string | number | boolean | string[]>;
};

export type Category = { id: string; name: string; parentId: string | null; description: string; tone: [string, string]; pattern: Pattern; visible: boolean };
export const categorySeed: Category[] = [
  { id: "c-sarees", name: "Sarees", parentId: null, description: "Six yards, woven to order.", tone: ["#1b2a8f", "#f6b21d"], pattern: "stripes", visible: true },
  { id: "c-silk", name: "Silk sarees", parentId: "c-sarees", description: "Ilkal, Patola and Kanjivaram.", tone: ["#a3122a", "#ffd166"], pattern: "checks", visible: true },
  { id: "c-cotton", name: "Cotton sarees", parentId: "c-sarees", description: "Everyday drapes.", tone: ["#0f6b5c", "#e6f4ea"], pattern: "dots", visible: true },
  { id: "c-dupattas", name: "Dupattas", parentId: null, description: "Hand-printed and dyed.", tone: ["#b4452a", "#f4e3c1"], pattern: "diamond", visible: true },
  { id: "c-stoles", name: "Stoles", parentId: null, description: "Light layers for every season.", tone: ["#d8386b", "#ffd6e2"], pattern: "dots", visible: true },
  { id: "c-kurtas", name: "Kurtas", parentId: null, description: "Block-printed daywear.", tone: ["#0f6b5c", "#e6f4ea"], pattern: "checks", visible: true },
  { id: "c-home", name: "Home", parentId: null, description: "Throws, cushions and bedspreads.", tone: ["#2b1b5e", "#d6542f"], pattern: "waves", visible: true },
  { id: "c-bedding", name: "Bedding", parentId: "c-home", description: "Bedspreads and throws.", tone: ["#244a63", "#f4efe1"], pattern: "waves", visible: true },
  { id: "c-cushions", name: "Cushions", parentId: "c-home", description: "Ikat and kantha covers.", tone: ["#1a2a6c", "#e9ecff"], pattern: "diamond", visible: true },
  { id: "c-dresses", name: "Dresses", parentId: null, description: "Linen and mulmul.", tone: ["#3340ff", "#dfe3ff"], pattern: "checks", visible: true },
];

export const productSeed: Product[] = [
  { id: "p1", name: "Ilkal Silk Saree, Indigo", sku: "KT-SAR-001", price: 8400, compare: 9800, stock: 42, reorder: 15, status: "active", tone: ["#1b2a8f", "#f6b21d"], pattern: "stripes", sold: 214, categoryId: "c-silk", description: "Handmade in small batches by our partner weavers. Colour may vary slightly from screen.", tags: ["handloom", "festive"], options: [], custom: { fabric: "Silk" } },
  { id: "p2", name: "Kalamkari Dupatta", sku: "KT-DUP-014", price: 2100, stock: 118, reorder: 30, status: "active", tone: ["#b4452a", "#f4e3c1"], pattern: "diamond", sold: 388, categoryId: "c-dupattas", description: "Handmade in small batches by our partner weavers. Colour may vary slightly from screen.", tags: ["block-print"], options: [], custom: { fabric: "Cotton" } },
  { id: "p3", name: "Bandhani Stole, Rose", sku: "KT-STO-021", price: 1650, stock: 9, reorder: 20, status: "active", tone: ["#d8386b", "#ffd6e2"], pattern: "dots", sold: 276, categoryId: "c-stoles", description: "Handmade in small batches by our partner weavers. Colour may vary slightly from screen.", tags: ["bestseller"], options: [], custom: { fabric: "Georgette" } },
  { id: "p4", name: "Block Print Kurta Set", sku: "KT-KUR-033", price: 3200, compare: 3800, stock: 64, reorder: 25, status: "active", tone: ["#0f6b5c", "#e6f4ea"], pattern: "checks", sold: 192, categoryId: "c-kurtas", description: "Handmade in small batches by our partner weavers. Colour may vary slightly from screen.", tags: ["new"], options: [{ name: "Size", values: ["S", "M", "L", "XL"] }], custom: { fabric: "Cotton" } },
  { id: "p5", name: "Ajrakh Bedspread", sku: "KT-HOM-004", price: 5600, stock: 0, reorder: 10, status: "active", tone: ["#2b1b5e", "#d6542f"], pattern: "waves", sold: 88, categoryId: "c-bedding", description: "Handmade in small batches by our partner weavers. Colour may vary slightly from screen.", tags: [], options: [], custom: { fabric: "Cotton" } },
  { id: "p6", name: "Chanderi Scarf, Saffron", sku: "KT-SCF-018", price: 1250, stock: 205, reorder: 40, status: "active", tone: ["#f2a413", "#fff1cf"], pattern: "stripes", sold: 301, categoryId: "c-stoles", description: "Handmade in small batches by our partner weavers. Colour may vary slightly from screen.", tags: ["bestseller", "gift"], options: [], custom: { fabric: "Silk" } },
  { id: "p7", name: "Pochampally Ikat Cushion", sku: "KT-HOM-011", price: 950, stock: 77, reorder: 20, status: "active", tone: ["#1a2a6c", "#e9ecff"], pattern: "diamond", sold: 164, categoryId: "c-cushions", description: "Handmade in small batches by our partner weavers. Colour may vary slightly from screen.", tags: ["gift"], options: [], custom: { fabric: "Cotton" } },
  { id: "p8", name: "Mulmul Kurta, Sage", sku: "KT-KUR-040", price: 2450, stock: 31, reorder: 15, status: "draft", tone: ["#7d9a6a", "#eef3e4"], pattern: "dots", sold: 0, categoryId: "c-kurtas", description: "Handmade in small batches by our partner weavers. Colour may vary slightly from screen.", tags: ["new"], options: [], custom: { fabric: "Cotton" } },
  { id: "p9", name: "Patola Border Saree", sku: "KT-SAR-009", price: 14800, stock: 6, reorder: 5, status: "active", tone: ["#a3122a", "#ffd166"], pattern: "checks", sold: 41, categoryId: "c-silk", description: "Handmade in small batches by our partner weavers. Colour may vary slightly from screen.", tags: ["festive", "heirloom"], options: [], custom: { fabric: "Silk" } },
  { id: "p10", name: "Kantha Throw", sku: "KT-HOM-019", price: 4100, stock: 23, reorder: 10, status: "active", tone: ["#244a63", "#f4efe1"], pattern: "waves", sold: 57, categoryId: "c-bedding", description: "Handmade in small batches by our partner weavers. Colour may vary slightly from screen.", tags: ["handloom"], options: [], custom: { fabric: "Cotton" } },
  { id: "p11", name: "Tussar Dupatta, Madder", sku: "KT-DUP-022", price: 2750, stock: 52, reorder: 15, status: "archived", tone: ["#8c2f1b", "#fbe3c2"], pattern: "stripes", sold: 120, categoryId: "c-dupattas", description: "Handmade in small batches by our partner weavers. Colour may vary slightly from screen.", tags: [], options: [], custom: { fabric: "Cotton" } },
  { id: "p12", name: "Linen Shirt Dress", sku: "KT-DRS-006", price: 3900, stock: 38, reorder: 12, status: "active", tone: ["#3340ff", "#dfe3ff"], pattern: "checks", sold: 73, categoryId: "c-dresses", description: "Handmade in small batches by our partner weavers. Colour may vary slightly from screen.", tags: ["new"], options: [], custom: { fabric: "Linen" } },
];


export const locations = [
  { id: "l1", name: "Whitefield warehouse", kind: "Warehouse", city: "Bengaluru" },
  { id: "l2", name: "Indiranagar store", kind: "Store", city: "Bengaluru" },
  { id: "l3", name: "Jaipur flagship", kind: "Store", city: "Jaipur" },
];

export const stockByLocation: Record<string, [number, number, number]> = {
  p1: [30, 8, 4], p2: [80, 22, 16], p3: [3, 4, 2], p4: [40, 14, 10], p5: [0, 0, 0], p6: [150, 30, 25],
  p7: [50, 17, 10], p8: [20, 6, 5], p9: [2, 1, 3], p10: [14, 5, 4], p11: [40, 8, 4], p12: [22, 9, 7],
};

export const movements = [
  { id: "m1", when: "Today, 11:42", type: "Sale", sku: "KT-STO-021", qty: -2, where: "Indiranagar store", by: "Rohan Das" },
  { id: "m2", when: "Today, 10:15", type: "Transfer", sku: "KT-SAR-001", qty: 8, where: "Whitefield warehouse → Jaipur flagship", by: "Tara Nair" },
  { id: "m3", when: "Today, 09:03", type: "Receive", sku: "KT-DUP-014", qty: 60, where: "Whitefield warehouse", by: "Tara Nair" },
  { id: "m4", when: "Yesterday", type: "Adjust", sku: "KT-HOM-004", qty: -3, where: "Jaipur flagship", by: "Isha Patel" },
  { id: "m5", when: "Yesterday", type: "Return", sku: "KT-KUR-033", qty: 1, where: "Indiranagar store", by: "Rohan Das" },
];

export type Order = {
  id: string; customer: string; items: number; total: number;
  status: "paid" | "packed" | "shipped" | "delivered" | "refunded";
  channel: "Online store" | "POS" | "WhatsApp"; when: string; city: string;
};
export const orders: Order[] = [
  { id: "#2481", customer: "Ananya Krishnan", items: 3, total: 11850, status: "paid", channel: "Online store", when: "12 min ago", city: "Chennai" },
  { id: "#2480", customer: "Rahul Verma", items: 1, total: 8400, status: "packed", channel: "POS", when: "41 min ago", city: "Bengaluru" },
  { id: "#2479", customer: "Zoya Khan", items: 2, total: 3750, status: "shipped", channel: "WhatsApp", when: "2 h ago", city: "Hyderabad" },
  { id: "#2478", customer: "Meghna Rao", items: 5, total: 16200, status: "delivered", channel: "Online store", when: "5 h ago", city: "Mumbai" },
  { id: "#2477", customer: "Sourav Ghosh", items: 1, total: 2100, status: "refunded", channel: "Online store", when: "Yesterday", city: "Kolkata" },
  { id: "#2476", customer: "Priya Nambiar", items: 2, total: 4300, status: "delivered", channel: "POS", when: "Yesterday", city: "Kochi" },
  { id: "#2475", customer: "Aditya Jain", items: 4, total: 9800, status: "shipped", channel: "Online store", when: "Yesterday", city: "Jaipur" },
];

export const revenue = [38, 42, 35, 51, 47, 62, 58, 54, 66, 61, 79, 72, 88, 94];
export const visits = [22, 30, 26, 34, 33, 41, 38, 40, 47, 44, 52, 49, 58, 63];

export const activity = [
  { id: "a1", who: "Lakshmi P", what: "published the Diwali hero on", target: "Site builder", when: "8 min ago" },
  { id: "a2", who: "Arjun Rao", what: "gave Sana Qureshi the role", target: "Store Manager", when: "1 h ago" },
  { id: "a3", who: "Tara Nair", what: "received 60 units into", target: "Whitefield warehouse", when: "3 h ago" },
  { id: "a4", who: "Meera Iyer", what: "added a field to", target: "Reviews", when: "Yesterday" },
  { id: "a5", who: "System", what: "verified domain", target: "shop.kaveritextiles.in", when: "Yesterday" },
];

/* ---------- people & roles ---------- */
export type Person = {
  id: string; name: string; email: string; roleId: string; parentId: string | null;
  scope: string; status: "active" | "invited" | "suspended"; last: string; color: string;
  title?: string; phone?: string; teamIds?: string[]; overrides?: Record<string, string>; notes?: string;
};
export type Team = { id: string; name: string; color: string; description: string };
export const teamSeed: Team[] = [
  { id: "tm1", name: "Stores", color: "#7a3cff", description: "Everyone on a shop floor." },
  { id: "tm2", name: "Warehouse", color: "#a3122a", description: "Receiving, counting, dispatch." },
  { id: "tm3", name: "Online", color: "#d8386b", description: "Website, content and reviews." },
];
export const people: Person[] = [
  { id: "u1", name: "Meera Iyer", email: "meera@kaveritextiles.in", roleId: "owner", parentId: null, scope: "All branches", status: "active", last: "Now", color: "#3340ff", teamIds: [] },
  { id: "u2", name: "Arjun Rao", email: "arjun@kaveritextiles.in", roleId: "regional", parentId: "u1", scope: "South region", status: "active", last: "5 min ago", color: "#1f7a4d", teamIds: [] },
  { id: "u3", name: "Kabir Shah", email: "kabir@kaveritextiles.in", roleId: "regional", parentId: "u1", scope: "West region", status: "active", last: "2 h ago", color: "#e08a00", teamIds: [] },
  { id: "u10", name: "Lakshmi P", email: "lakshmi@kaveritextiles.in", roleId: "editor", parentId: "u1", scope: "Website only", status: "active", last: "8 min ago", color: "#d8386b", teamIds: ["tm3"] },
  { id: "u4", name: "Sana Qureshi", email: "sana@kaveritextiles.in", roleId: "manager", parentId: "u2", scope: "Indiranagar store", status: "active", last: "1 h ago", color: "#7a3cff", teamIds: ["tm1"] },
  { id: "u5", name: "Dev Menon", email: "dev@kaveritextiles.in", roleId: "manager", parentId: "u2", scope: "Whitefield warehouse", status: "active", last: "Yesterday", color: "#0f6b5c", teamIds: ["tm2"] },
  { id: "u11", name: "neha@kaveritextiles.in", email: "neha@kaveritextiles.in", roleId: "manager", parentId: "u2", scope: "Koramangala store", status: "invited", last: "Invite sent", color: "#888fb0", teamIds: [] },
  { id: "u6", name: "Isha Patel", email: "isha@kaveritextiles.in", roleId: "manager", parentId: "u3", scope: "Jaipur flagship", status: "active", last: "3 h ago", color: "#f0452b", teamIds: ["tm1"] },
  { id: "u7", name: "Rohan Das", email: "rohan@kaveritextiles.in", roleId: "cashier", parentId: "u4", scope: "Indiranagar store", status: "active", last: "12 min ago", color: "#244a63", teamIds: ["tm1"] },
  { id: "u8", name: "Tara Nair", email: "tara@kaveritextiles.in", roleId: "stock", parentId: "u5", scope: "Whitefield warehouse", status: "active", last: "3 h ago", color: "#a3122a", teamIds: ["tm2"] },
  { id: "u9", name: "Vikram Joshi", email: "vikram@kaveritextiles.in", roleId: "cashier", parentId: "u6", scope: "Jaipur flagship", status: "suspended", last: "6 days ago", color: "#8c8c9c", teamIds: [] },
];

export type Role = { id: string; name: string; description: string; inherits?: string; system?: boolean; tone: string; flags?: string[]; refundLimit?: number; discountLimit?: number };
export const specialPerms = [
  { id: "cost", label: "See cost price and margins", hint: "Hides purchase cost from everyone else." },
  { id: "refund", label: "Issue refunds", hint: "Up to the refund limit below." },
  { id: "discount", label: "Give discounts at the counter", hint: "Up to the discount limit below." },
  { id: "export", label: "Export data to CSV", hint: "Orders, customers and custom tables." },
  { id: "approve", label: "Approve reviews and entries", hint: "Publish customer-submitted records." },
  { id: "impersonate", label: "View the store as a customer", hint: "Preview carts and checkout." },
];
export const roles: Role[] = [
  { id: "owner", name: "Owner", description: "Everything, including billing and domains.", system: true, tone: "#3340ff", flags: ["cost", "refund", "discount", "export", "approve", "impersonate"], refundLimit: 100000, discountLimit: 50 },
  { id: "regional", name: "Regional manager", description: "Runs several stores and manages their staff.", inherits: "manager", tone: "#1f7a4d", flags: ["cost", "refund", "discount", "export", "approve"], refundLimit: 25000, discountLimit: 25 },
  { id: "manager", name: "Store manager", description: "Runs one location day to day.", inherits: "cashier", tone: "#7a3cff", flags: ["refund", "discount", "approve"], refundLimit: 5000, discountLimit: 15 },
  { id: "cashier", name: "Cashier", description: "Rings up sales and handles returns.", tone: "#244a63", flags: ["discount"], refundLimit: 0, discountLimit: 5 },
  { id: "stock", name: "Stock keeper", description: "Receives, counts and transfers inventory.", tone: "#a3122a", flags: ["cost"] },
  { id: "editor", name: "Content editor", description: "Edits the website and moderates reviews.", tone: "#d8386b", flags: ["approve"] },
];

export const resources = [
  { id: "products", label: "Products" },
  { id: "inventory", label: "Inventory" },
  { id: "orders", label: "Orders" },
  { id: "customers", label: "Customers" },
  { id: "reviews", label: "Reviews", custom: true },
  { id: "site", label: "Website builder" },
  { id: "users", label: "People & roles" },
  { id: "settings", label: "Settings & billing" },
];
export const actions = [
  { id: "v", label: "View" },
  { id: "c", label: "Create" },
  { id: "e", label: "Edit" },
  { id: "d", label: "Delete" },
  { id: "x", label: "Export" },
];
export const seedMatrix: Record<string, Record<string, string>> = {
  owner: { products: "vcedx", inventory: "vcedx", orders: "vcedx", customers: "vcedx", reviews: "vcedx", site: "vcedx", users: "vcedx", settings: "vcedx" },
  regional: { products: "vcex", inventory: "vcex", orders: "vcex", customers: "vx", reviews: "vced", site: "v", users: "vc", settings: "v" },
  manager: { products: "vce", inventory: "vce", orders: "vce", customers: "v", reviews: "ve", site: "", users: "v", settings: "" },
  cashier: { products: "v", inventory: "v", orders: "vc", customers: "v", reviews: "", site: "", users: "", settings: "" },
  stock: { products: "ve", inventory: "vced", orders: "v", customers: "", reviews: "", site: "", users: "", settings: "" },
  editor: { products: "v", inventory: "", orders: "", customers: "", reviews: "vced", site: "vced", users: "", settings: "" },
};

/* ---------- dynamic entities ---------- */
export type FieldType = "text" | "longtext" | "number" | "currency" | "percent" | "rating" | "select" | "multiselect" | "boolean" | "date" | "relation" | "lookup" | "rollup" | "file" | "email" | "phone" | "url" | "color";
export type Agg = "count" | "sum" | "avg" | "min" | "max" | "list";
export type Field = { id: string; key: string; label: string; type: FieldType; required?: boolean; options?: string[]; optionColors?: Record<string, string>; target?: string; many?: boolean; inverse?: string; via?: string; show?: string; agg?: Agg; inList?: boolean; locked?: boolean; help?: string; placeholder?: string; defaultValue?: string; min?: number; max?: number; hidden?: boolean; half?: boolean; unique?: boolean };
export type Entity = {
  id: string; name: string; plural: string; slug: string; description: string; icon: string;
  system?: boolean; publicOnStore: boolean; fields: Field[]; records: Rec[]; color?: string; view?: "table" | "cards" | "board"; boardField?: string; titleField?: string; approval?: boolean; collect?: boolean;
};
export type Rec = Record<string, string | number | boolean | string[]>;

export const fieldTypes: { type: FieldType; label: string; hint: string }[] = [
  { type: "text", label: "Short text", hint: "Names, titles" },
  { type: "longtext", label: "Long text", hint: "Comments, notes" },
  { type: "number", label: "Number", hint: "Quantity, score" },
  { type: "currency", label: "Money", hint: "Amounts in ₹" },
  { type: "percent", label: "Percent", hint: "0 to 100" },
  { type: "rating", label: "Star rating", hint: "1 to 5 stars" },
  { type: "select", label: "Choice", hint: "One of a list" },
  { type: "multiselect", label: "Multiple choice", hint: "Several tags" },
  { type: "boolean", label: "Yes / no", hint: "A toggle" },
  { type: "date", label: "Date", hint: "Calendar date" },
  { type: "relation", label: "Link to table", hint: "Customer, product, order…" },
  { type: "lookup", label: "Lookup", hint: "Pull a value from a linked record" },
  { type: "rollup", label: "Rollup", hint: "Count, sum or average linked records" },
  { type: "file", label: "File or photo", hint: "Uploads" },
  { type: "email", label: "Email", hint: "Validated address" },
  { type: "phone", label: "Phone", hint: "Contact number" },
  { type: "url", label: "Link", hint: "Web address" },
  { type: "color", label: "Colour", hint: "Swatch picker" },
];

export const entitySeed: Entity[] = [
  {
    id: "e1", name: "Review", plural: "Reviews", slug: "reviews", icon: "Star", color: "#ffb61e", view: "cards", approval: true, collect: true, titleField: "title", publicOnStore: true,
    description: "Customer reviews shown on product pages after you approve them.",
    fields: [
      { id: "f1", key: "product", label: "Product", type: "relation", target: "@products", inverse: "Reviews", required: true, inList: true },
      { id: "f7", key: "customer", label: "Customer", type: "relation", target: "e5", inverse: "Reviews", inList: true },
      { id: "f8", key: "fabric", label: "Fabric", type: "lookup", via: "product", show: "fabric", inList: true },
      { id: "f2", key: "rating", label: "Rating", type: "rating", required: true, inList: true },
      { id: "f3", key: "title", label: "Headline", type: "text", inList: true },
      { id: "f4", key: "body", label: "Review", type: "longtext", required: true },
      { id: "f5", key: "verified", label: "Verified purchase", type: "boolean", inList: true },
      { id: "f6", key: "photos", label: "Photos", type: "file" },
    ],
    records: [
      { id: "r1", product: ["p1"], customer: ["k1"], rating: 5, title: "The border is unreal in person", body: "Draped beautifully and the zari hasn't tarnished after three wears. Packaging felt like a gift.", verified: true, author: "Ananya K." },
      { id: "r2", product: ["p3"], customer: ["k3"], rating: 4, title: "Softer than expected", body: "Colour is slightly deeper than the photos, which I love. Fringe could be tighter.", verified: true, author: "Zoya K." },
      { id: "r3", product: ["p4"], customer: ["k4"], rating: 5, title: "Fits true to size", body: "Ordered an M after reading the size notes, perfect. Block print is crisp.", verified: true, author: "Meghna R." },
      { id: "r4", product: ["p2"], customer: ["k6"], rating: 3, title: "Pretty, but creased", body: "Arrived creased and took two washes to settle. Design is lovely though.", verified: false, author: "Priya N." },
      { id: "r5", product: ["p6"], customer: ["k2"], rating: 5, title: "Wore it to a wedding, got stopped twice", body: "The saffron is warmer in daylight. Soft enough for all-day wear.", verified: true, author: "Rahul V.", _pending: true, _src: "Website form", _at: "10 Oct" },
    ],
  },
  {
    id: "e2", name: "Feedback", plural: "Store feedback", slug: "feedback", icon: "MessageSquareHeart", color: "#3340ff", view: "table", titleField: "comment", collect: true, publicOnStore: false,
    description: "NPS and comments collected in store, on WhatsApp and on the website.",
    fields: [
      { id: "g1", key: "score", label: "How likely are you to recommend us?", type: "number", min: 0, max: 10, required: true, inList: true },
      { id: "g2", key: "channel", label: "Channel", type: "select", options: ["In store", "Website", "WhatsApp"], inList: true },
      { id: "g3", key: "comment", label: "Comment", type: "longtext" },
      { id: "g4", key: "date", label: "Submitted", type: "date", inList: true },
    ],
    records: [
      { id: "q1", score: 10, channel: "In store", comment: "Staff helped me match a dupatta to my saree. Lovely.", date: "09 Oct" },
      { id: "q2", score: 8, channel: "Website", comment: "Checkout was quick. Wish there were more saree filters.", date: "08 Oct" },
      { id: "q3", score: 6, channel: "WhatsApp", comment: "Reply took a day.", date: "06 Oct" },
    ],
  },
  {
    id: "e3", name: "Warranty claim", plural: "Warranty claims", slug: "warranty", icon: "ShieldCheck", color: "#f0452b", view: "board", boardField: "status", titleField: "order", collect: true, publicOnStore: false,
    description: "Repair and replacement requests linked to an order.",
    fields: [
      { id: "w1", key: "order", label: "Order", type: "relation", target: "@orders", inverse: "Warranty claims", required: true, inList: true },
      { id: "w5", key: "customer", label: "Customer", type: "relation", target: "e5", inverse: "Warranty claims", inList: true },
      { id: "w2", key: "issue", label: "Issue", type: "select", options: ["Colour bleed", "Loose thread", "Wrong size", "Damaged"], inList: true },
      { id: "w3", key: "status", label: "Status", type: "select", options: ["Open", "In review", "Resolved"], optionColors: { Open: "#f0452b", "In review": "#e08a00", Resolved: "#1f7a4d" }, inList: true },
      { id: "w4", key: "photos", label: "Photos", type: "file" },
    ],
    records: [
      { id: "c1", order: ["#2481"], customer: ["k1"], issue: "Colour bleed", status: "In review" },
      { id: "c2", order: ["#2476"], customer: ["k6"], issue: "Loose thread", status: "Resolved" },
    ],
  },
  {
    id: "e5", name: "Customer", plural: "Customers", slug: "customers", icon: "Users", color: "#d8386b", view: "table", titleField: "name", publicOnStore: false,
    description: "A light customer book. Reviews and warranty claims link back here.",
    fields: [
      { id: "k_n", key: "name", label: "Name", type: "text", required: true, inList: true },
      { id: "k_p", key: "phone", label: "Phone", type: "phone", inList: true, half: true },
      { id: "k_e", key: "email", label: "Email", type: "email", half: true },
      { id: "k_c", key: "city", label: "City", type: "text", inList: true, half: true },
      { id: "k_t", key: "tier", label: "Tier", type: "select", options: ["Regular", "Silver", "Gold"], optionColors: { Regular: "#8c8c9c", Silver: "#5a6b8c", Gold: "#e08a00" }, inList: true, half: true },
      { id: "k_o", key: "orders", label: "Orders", type: "relation", target: "@orders", many: true, inverse: "Customer", inList: true },
      { id: "k_s", key: "spend", label: "Lifetime spend", type: "rollup", via: "orders", show: "total", agg: "sum", inList: true },
    ],
    records: [
      { id: "k1", name: "Ananya Krishnan", phone: "+91 98450 12345", email: "ananya.k@example.com", city: "Chennai", tier: "Gold", orders: ["#2481"] },
      { id: "k2", name: "Rahul Verma", phone: "+91 99001 54321", email: "rahul.v@example.com", city: "Bengaluru", tier: "Regular", orders: ["#2480"] },
      { id: "k3", name: "Zoya Khan", phone: "+91 98860 77123", email: "zoya.khan@example.com", city: "Hyderabad", tier: "Silver", orders: ["#2479"] },
      { id: "k4", name: "Meghna Rao", phone: "+91 97420 33881", email: "meghna.rao@example.com", city: "Mumbai", tier: "Gold", orders: ["#2478"] },
      { id: "k6", name: "Priya Nambiar", phone: "+91 94470 21908", email: "priya.n@example.com", city: "Kochi", tier: "Silver", orders: ["#2476"] },
    ],
  },
  {
    id: "e6", name: "Weaver", plural: "Weavers", slug: "weavers", icon: "Scissors", color: "#0f6b5c", view: "cards", titleField: "name", publicOnStore: true,
    description: "The people behind each piece. Link their products and see totals update.",
    fields: [
      { id: "v_n", key: "name", label: "Name", type: "text", required: true, inList: true },
      { id: "v_v", key: "village", label: "Village", type: "text", inList: true, half: true },
      { id: "v_y", key: "years", label: "Years on the loom", type: "number", inList: true, half: true },
      { id: "v_b", key: "bio", label: "In their words", type: "longtext" },
      { id: "v_p", key: "products", label: "Pieces they weave", type: "relation", target: "@products", many: true, inverse: "Woven by", inList: true },
      { id: "v_c", key: "count", label: "Pieces", type: "rollup", via: "products", agg: "count", inList: true },
      { id: "v_a", key: "avg", label: "Average price", type: "rollup", via: "products", show: "price", agg: "avg" },
    ],
    records: [
      { id: "v1", name: "Lakshmamma", village: "Ilkal", years: 34, bio: "I learned on my mother's loom. The indigo border is the part I never rush.", products: ["p1", "p9"] },
      { id: "v2", name: "Imran Khatri", village: "Bhuj", years: 21, bio: "Ajrakh needs patience: twelve steps, and the river decides the colour.", products: ["p5", "p10", "p7"] },
      { id: "v3", name: "Savitri Devi", village: "Chanderi", years: 28, bio: "Silk this fine can only be woven in the early morning, when the air is damp.", products: ["p6", "p3"] },
    ],
  },
  {
    id: "e7", name: "Enquiry", plural: "Enquiries", slug: "enquiries", icon: "MessageSquareHeart", color: "#7a3cff", view: "board", boardField: "status", titleField: "name", collect: true, publicOnStore: false,
    description: "Questions from the Contact page. Link them to a product so the team has context.",
    fields: [
      { id: "n_n", key: "name", label: "Your name", type: "text", required: true, inList: true, half: true },
      { id: "n_e", key: "email", label: "Email", type: "email", required: true, inList: true, half: true },
      { id: "n_t", key: "topic", label: "What is it about?", type: "select", options: ["Order help", "Wholesale", "Custom order", "Something else"], optionColors: { "Order help": "#3340ff", Wholesale: "#e08a00", "Custom order": "#7a3cff", "Something else": "#8c8c9c" }, inList: true },
      { id: "n_p", key: "product", label: "Which product?", type: "relation", target: "@products", inverse: "Enquiries", help: "Optional. Helps us answer faster.", inList: true },
      { id: "n_m", key: "message", label: "Message", type: "longtext", required: true },
      { id: "n_s", key: "status", label: "Status", type: "select", options: ["New", "Replied", "Closed"], optionColors: { New: "#3340ff", Replied: "#e08a00", Closed: "#1f7a4d" }, inList: true, hidden: true },
    ],
    records: [
      { id: "n1", name: "Kavya Iyer", email: "kavya.i@example.com", topic: "Custom order", product: ["p9"], message: "Can the Patola border be woven in a deeper green? Wedding in March.", status: "New" },
      { id: "n2", name: "Dev Malhotra", email: "dev@malhotra.in", topic: "Wholesale", message: "We run three boutiques in Delhi. What are your trade terms?", status: "Replied" },
    ],
  },
  {
    id: "e8", name: "FAQ", plural: "FAQs", slug: "faq", icon: "CircleHelp", color: "#244a63", view: "table", titleField: "question", publicOnStore: true,
    description: "Questions shown on your Contact page. Visitors can search and filter by topic.",
    fields: [
      { id: "q_q", key: "question", label: "Question", type: "text", required: true, inList: true },
      { id: "q_a", key: "answer", label: "Answer", type: "longtext", required: true },
      { id: "q_t", key: "topic", label: "Topic", type: "select", options: ["Shipping", "Returns", "Care", "Payments"], optionColors: { Shipping: "#3340ff", Returns: "#e08a00", Care: "#1f7a4d", Payments: "#7a3cff" }, inList: true },
    ],
    records: [
      { id: "a1", question: "How long does shipping take?", answer: "Orders leave our warehouse in 48 hours and reach most cities in 3 to 5 days.", topic: "Shipping" },
      { id: "a2", question: "Can I return a saree?", answer: "Yes, within 15 days if the tags are intact and the piece is unwashed.", topic: "Returns" },
      { id: "a3", question: "How do I wash a silk saree?", answer: "Dry clean the first time. After that, a gentle cold wash in shade is fine for most handloom silks.", topic: "Care" },
      { id: "a4", question: "Do you offer cash on delivery?", answer: "Yes, for orders under ₹10,000. Larger orders can be paid by UPI or card.", topic: "Payments" },
      { id: "a5", question: "Do you ship abroad?", answer: "We ship to the US, UK, UAE and Singapore. Delivery takes 7 to 10 days.", topic: "Shipping" },
    ],
  },
  {
    id: "e4", name: "Product", plural: "Products", slug: "products", icon: "Package", color: "#7a3cff", system: true, view: "table", publicOnStore: true,
    description: "Built-in. Add your own fields to every product.",
    fields: [
      { id: "s1", key: "name", label: "Name", type: "text", locked: true, inList: true },
      { id: "s2", key: "price", label: "Price", type: "number", locked: true, inList: true },
      { id: "s3", key: "fabric", label: "Fabric", type: "select", options: ["Silk", "Cotton", "Linen", "Georgette"], inList: true },
      { id: "s5", key: "handmade", label: "Handmade", type: "boolean", inList: true },
      { id: "s4", key: "care", label: "Care instructions", type: "longtext" },
    ],
    records: [],
  },
];

/* ---------- website builder ---------- */
export type ThemePreset = { id: string; name: string; bg: string; fg: string; surface: string; brand: string; accent: string };
export const themePresets: ThemePreset[] = [
  { id: "indigo", name: "Indigo hour", bg: "#f6f4ee", fg: "#141a3a", surface: "#ffffff", brand: "#2a3bff", accent: "#ffb61e" },
  { id: "madder", name: "Madder", bg: "#fbf1e6", fg: "#3a1410", surface: "#fffaf3", brand: "#c8321f", accent: "#1e6b5c" },
  { id: "pistachio", name: "Pistachio", bg: "#eef3e4", fg: "#14251a", surface: "#f9fcf3", brand: "#1f7a4d", accent: "#ff7a45" },
  { id: "ink", name: "After dark", bg: "#0f1226", fg: "#f4f2ea", surface: "#171b38", brand: "#ffb61e", accent: "#7f8cff" },
];

export const fontPairs = [
  { id: "bold", name: "Bold", head: '"Bricolage Grotesque Variable", sans-serif', body: "var(--font-geist-sans), sans-serif" },
  { id: "editorial", name: "Editorial", head: "Georgia, 'Times New Roman', serif", body: "var(--font-geist-sans), sans-serif" },
  { id: "plain", name: "Plain", head: "var(--font-geist-sans), sans-serif", body: "var(--font-geist-sans), sans-serif" },
];

export type SectionType = "announcement" | "hero" | "marquee" | "collections" | "products" | "story" | "reviews" | "feedback" | "newsletter";
export type SectionDef = { type: SectionType; label: string; description: string; defaults: Record<string, string> };
export const sectionLibrary: SectionDef[] = [
  { type: "announcement", label: "Announcement bar", description: "One line above the header.", defaults: { text: "Free shipping across India on orders over ₹2,000" } },
  { type: "hero", label: "Hero banner", description: "Big headline with a call to action.", defaults: { headline: "Woven slowly, worn for years.", sub: "Handloom sarees and block-printed everyday wear, made by 140 weavers across Karnataka and Gujarat.", cta: "Shop the Diwali edit" } },
  { type: "marquee", label: "Ticker", description: "Scrolling line of short promises.", defaults: { text: "Handwoven · Naturally dyed · Ships in 48 hours · Easy 15-day returns" } },
  { type: "collections", label: "Collections", description: "Category tiles.", defaults: { headline: "Shop by category" } },
  { type: "products", label: "Product grid", description: "Best sellers or a hand-picked set.", defaults: { headline: "Fresh off the loom" } },
  { type: "story", label: "Brand story", description: "Image and a short paragraph.", defaults: { headline: "Forty looms. One family workshop.", sub: "We started with two looms in Ilkal in 1994. Today every piece still passes through the same hands that dyed the thread." } },
  { type: "reviews", label: "Reviews", description: "Pulls approved records from your Reviews entity.", defaults: { headline: "What customers say" } },
  { type: "feedback", label: "Feedback form", description: "Collects answers into your Feedback entity.", defaults: { headline: "How are we doing?" } },
  { type: "newsletter", label: "Email signup", description: "Collect emails for campaigns.", defaults: { headline: "Be first to the loom", sub: "New drops, once a fortnight. Nothing else." } },
];

export const defaultSections = [
  { id: "s-ann", type: "announcement" as SectionType, visible: true },
  { id: "s-hero", type: "hero" as SectionType, visible: true },
  { id: "s-mar", type: "marquee" as SectionType, visible: true },
  { id: "s-col", type: "collections" as SectionType, visible: true },
  { id: "s-pro", type: "products" as SectionType, visible: true },
  { id: "s-sto", type: "story" as SectionType, visible: true },
  { id: "s-rev", type: "reviews" as SectionType, visible: true },
  { id: "s-new", type: "newsletter" as SectionType, visible: true },
];
