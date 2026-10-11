import type { Entity, Field, Rec } from "./data";

type F = Omit<Field, "id">;
export type EntityTemplate = {
  id: string; name: string; plural: string; icon: string; color: string; description: string;
  view: NonNullable<Entity["view"]>; boardField?: string; titleField: string; fields: F[]; records: Rec[];
};

const tone = (o: Record<string, string>) => o;

export const entityTemplates: EntityTemplate[] = [
  {
    id: "tpl-size", name: "Size guide", plural: "Size guides", icon: "Ruler", color: "#0f6b5c", view: "table", titleField: "category",
    description: "Measurements shoppers can check before they order.",
    fields: [
      { key: "category", label: "Category", type: "text", required: true, inList: true },
      { key: "size", label: "Size", type: "select", options: ["XS", "S", "M", "L", "XL"], inList: true },
      { key: "chest", label: "Chest (in)", type: "number", inList: true, half: true },
      { key: "waist", label: "Waist (in)", type: "number", inList: true, half: true },
      { key: "note", label: "Fit note", type: "longtext" },
    ],
    records: [
      { category: "Kurtas", size: "M", chest: 38, waist: 34, note: "Relaxed fit, order your usual size." },
      { category: "Kurtas", size: "L", chest: 40, waist: 36, note: "Relaxed fit." },
    ],
  },
  {
    id: "tpl-leads", name: "Wholesale lead", plural: "Wholesale leads", icon: "Handshake", color: "#e08a00", view: "board", boardField: "stage", titleField: "company",
    description: "Boutiques and resellers who asked for trade prices.",
    fields: [
      { key: "company", label: "Company", type: "text", required: true, inList: true },
      { key: "contact", label: "Contact email", type: "email", inList: true },
      { key: "volume", label: "Monthly volume", type: "currency", inList: true },
      { key: "stage", label: "Stage", type: "select", options: ["New", "Sampling", "Negotiating", "Won", "Lost"], optionColors: tone({ New: "#3340ff", Sampling: "#e08a00", Negotiating: "#7a3cff", Won: "#1f7a4d", Lost: "#8c8c9c" }), inList: true },
      { key: "interests", label: "Interested in", type: "multiselect", options: ["Sarees", "Dupattas", "Home", "Kurtas"] },
    ],
    records: [
      { company: "Anokhi Boutique, Pune", contact: "buy@anokhi.in", volume: 120000, stage: "Sampling", interests: ["Sarees"] },
      { company: "The Weave Room", contact: "hello@weaveroom.com", volume: 60000, stage: "New", interests: ["Dupattas", "Home"] },
      { company: "Sutra Gifts", contact: "orders@sutra.in", volume: 90000, stage: "Won", interests: ["Home"] },
    ],
  },
  {
    id: "tpl-repair", name: "Repair request", plural: "Repair requests", icon: "Wrench", color: "#f0452b", view: "board", boardField: "status", titleField: "item",
    description: "Alterations and repairs, tracked from drop-off to pickup.",
    fields: [
      { key: "item", label: "Item", type: "text", required: true, inList: true },
      { key: "order", label: "Order", type: "relation", target: "@orders", inverse: "Warranty claims", inList: true },
      { key: "status", label: "Status", type: "select", options: ["Received", "In progress", "Ready", "Collected"], optionColors: tone({ Received: "#3340ff", "In progress": "#e08a00", Ready: "#1f7a4d", Collected: "#8c8c9c" }), inList: true },
      { key: "due", label: "Due", type: "date", inList: true },
      { key: "photos", label: "Photos", type: "file" },
    ],
    records: [
      { item: "Zari border re-stitch", order: "#2431", status: "In progress", due: "14 Oct" },
      { item: "Hem shortening", order: "#2402", status: "Received", due: "16 Oct" },
    ],
  },
  {
    id: "tpl-visit", name: "Store visit", plural: "Store visits", icon: "MapPinned", color: "#7a3cff", view: "table", titleField: "visitor",
    description: "Walk-ins and appointments logged by branch.",
    fields: [
      { key: "visitor", label: "Visitor", type: "text", required: true, inList: true },
      { key: "branch", label: "Branch", type: "select", options: ["Indiranagar", "Jaipur", "Whitefield"], inList: true },
      { key: "date", label: "Date", type: "date", inList: true },
      { key: "bought", label: "Bought something", type: "boolean", inList: true },
      { key: "notes", label: "Notes", type: "longtext" },
    ],
    records: [{ visitor: "Neha M.", branch: "Indiranagar", date: "10 Oct", bought: true, notes: "Looking for a wedding saree." }],
  },
  {
    id: "tpl-faq", name: "FAQ", plural: "FAQs", icon: "CircleHelp", color: "#244a63", view: "cards", titleField: "question",
    description: "Questions you can show on any page of your website.",
    fields: [
      { key: "question", label: "Question", type: "text", required: true, inList: true },
      { key: "answer", label: "Answer", type: "longtext", required: true },
      { key: "topic", label: "Topic", type: "select", options: ["Shipping", "Returns", "Care", "Payments"], inList: true },
    ],
    records: [
      { question: "How long does shipping take?", answer: "Orders leave our warehouse in 48 hours and reach most cities in 3 to 5 days.", topic: "Shipping" },
      { question: "Can I return a saree?", answer: "Yes, within 15 days if the tags are intact.", topic: "Returns" },
    ],
  },
  {
    id: "tpl-team", name: "Weaver profile", plural: "Weavers", icon: "Users", color: "#d8386b", view: "cards", titleField: "name",
    description: "Meet-the-maker stories you can feature on the website.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true, inList: true },
      { key: "village", label: "Village", type: "text", inList: true },
      { key: "craft", label: "Craft", type: "select", options: ["Ilkal", "Ikat", "Block print", "Kalamkari"], inList: true },
      { key: "years", label: "Years weaving", type: "number", inList: true },
      { key: "story", label: "Story", type: "longtext" },
      { key: "portrait", label: "Portrait", type: "file" },
    ],
    records: [{ name: "Shantamma", village: "Ilkal", craft: "Ilkal", years: 32, story: "Learned at her mother's loom at nine." }],
  },
];
