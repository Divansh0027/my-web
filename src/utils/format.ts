export function formatPrice(price: number, compact = false): string {
  if (price >= 10000000) {
    const v = price / 10000000;
    return `₹${v % 1 === 0 ? v : v.toFixed(2)} ${compact ? 'Cr' : 'Crore'}`;
  }
  if (price >= 100000) {
    const v = price / 100000;
    return `₹${v % 1 === 0 ? v : v.toFixed(1)} ${compact ? 'L' : 'Lakhs'}`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}
