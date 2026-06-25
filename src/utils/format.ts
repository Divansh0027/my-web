export function formatPrice(price: number): string {
  if (price >= 10000000) {
    const crores = price / 10000000;
    return `₹${crores % 1 === 0 ? crores : crores.toFixed(2)} Crore`;
  } else if (price >= 100000) {
    const lakhs = price / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(2)} Lakhs`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}
