import { clients } from "../lib/config";
import { getInvoicePaths, readInvoiceData } from "../lib/files";

export default () => {
  const invoicePaths = getInvoicePaths();
  const data = readInvoiceData(invoicePaths);

  console.table(
    clients.map(({ id, company }) => ({
      id,
      company,
      numInv: data.filter((inv) => inv.to === id).length,
    }))
  );
};
