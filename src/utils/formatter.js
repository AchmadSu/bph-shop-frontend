export function formatIDR(amount) {
  if (!amount) return "Rp0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
}

export function formatDate(date) {
  if(!date) return;
  return new Date(date).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}