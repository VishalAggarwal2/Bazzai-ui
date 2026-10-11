export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
export const initials = (name: string) =>
  name.replace(/@.*/, "").split(/[\s.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
