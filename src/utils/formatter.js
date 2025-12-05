export function formatIDR(amount) {
  if (!amount) return "Rp0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
}