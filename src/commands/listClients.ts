import { clients } from "../lib/config";
import { getInvoicePaths, readInvoiceData } from "../lib/files";

export default (options: { csv: boolean | undefined }) => {
  const invoicePaths = getInvoicePaths();
  const invoiceData = readInvoiceData(invoicePaths);

  if (options.csv) {
    clients.map((c) => console.log(Object.values(c).join(",")));
  } else {
    const data = clients.map(({ id, company }) => ({
      id,
      company,
      numInv: invoiceData.filter((inv) => inv.to === id).length,
    }));

    console.table(data);
  }
};
