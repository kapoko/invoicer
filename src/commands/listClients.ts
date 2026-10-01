import { getConfig } from "../lib/config.js";
import { getInvoices } from "../lib/invoice.js";
import type { InvoiceData } from "../types.js";

export default (options: { csv: boolean | undefined }) => {
  const invoices = getInvoices();
  const { clients } = getConfig();

  if (options.csv) {
    clients.map((c) => console.log(Object.values(c).join(",")));
  } else {
    const data = clients.map(({ id, company }) => {
      const clientInvoices = invoices.filter((i) => i.client.id === id);

      return {
        id,
        company,
        numInv: clientInvoices.length,
        revenue: clientInvoices
          .map((i: InvoiceData) => i.subtotal)
          .reduce((a, b) => a + b, 0),
      };
    });

    console.table(data);
  }
};
