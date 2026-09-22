export function formatPrice(
  amount: string | number,
  currencyCode = "INR",
): string {
  const value = Number(amount);

  if (!Number.isFinite(value)) return String(amount);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value);
}
