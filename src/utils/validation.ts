export function validatePropertyStep1(title: string, description: string, locality: string): string | null {
  if (title.trim().length < 10) {
    return "Title must be at least 10 characters long to guide buyers.";
  }
  if (description.trim().length < 30) {
    return "Please write a comprehensive description (at least 30 characters).";
  }
  if (!locality.trim()) {
    return "Locality coordinates cannot be empty.";
  }
  return null;
}

export function validatePropertyStep2(price: string | number, area: string | number): string | null {
  const priceVal = Number(price);
  if (!price || isNaN(priceVal) || priceVal <= 0) {
    return "Please enter a valid positive property price.";
  }
  const areaVal = Number(area);
  if (!area || isNaN(areaVal) || areaVal <= 0) {
    return "Please specify a valid property area.";
  }
  return null;
}
