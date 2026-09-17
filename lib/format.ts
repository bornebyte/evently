export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(amount: number) {
  if (amount < 1000) return String(amount);
  return `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(amount / 1000)}k`;
}
