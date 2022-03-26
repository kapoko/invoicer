import { getInvoices } from "../lib/invoice";
import { getConfig } from "../lib/config";

export default () => {
  const invoices = getInvoices();
  const { locale } = getConfig().invoice;

  invoices.forEach((invoice) => {
    const {
      invoiceNumber,
      client: { company },
      date,
      vat,
      items,
    } = invoice;

    const dateLocal = date.toLocaleDateString(locale);

    // If an invoice contains multiple vat values, log a line for each
    for (let v of Object.keys(vat)) {
      // Subtotal for this vat
      const vat = parseFloat(v);
      const subtotal = items
        .filter((item) => item.vat === vat)
        .reduce((sum, item) => sum + item.total, 0)
        .toLocaleString(locale);

      let info = [
        invoiceNumber,
        dateLocal,
        company,
        `"${subtotal}"`,
        `"${vat.toLocaleString(locale)}"`,
      ];

      console.log(info.join(","));
    }
  });
};
