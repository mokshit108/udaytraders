// Prices come out of Postgres as numeric strings ("1650.00"), so normalise
// before grouping them the Indian way: ₹1,650 / ₹2,58,810.
export const inr = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
};
