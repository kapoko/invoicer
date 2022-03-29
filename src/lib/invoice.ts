import { basename } from "path";
import { InvoiceData, InvoiceDataItem, VatIndex } from "../types";
import { getInvoicePaths, readInvoiceData } from "./files";
import { getConfig } from "../lib/config";

/**
 * Generate InvoiceData array from invoice ids
 */
export const getInvoices = (invoiceIds: string[] = []) => {
  const invoicePaths = getInvoicePaths(invoiceIds);
  const data = readInvoiceData(invoicePaths);

  const invoices: InvoiceData[] = data.map((inv, index) => {
    // Date
    const date = inv.date;
    const { company, clients } = getConfig();

    // Invoice number, check if filename is a number
    const invoiceNumber = parseInt(basename(invoicePaths[index], ".yml"));
    if (isNaN(invoiceNumber)) {
      throw new Error(
        `Invoice file ${basename(invoicePaths[index])} is not numeric.`
      );
    }

    // Find client, throw error if it doesn't exist
    const client = clients.find((c) => c.id === inv.to);
    if (!client) {
      throw new Error(`Client with id ${inv.to} doesn't exist`);
    }

    // Transform the data from yaml to more readable data
    const items: InvoiceDataItem[] = inv.items.map((item) => ({
      title: item.t,
      price: item.p,
      amount: item.a || 1,
      total: item.p * (item.a || 1),
      description: item.d,
      vat: item.v || item.v === 0 ? item.v : getConfig().invoice.defaultVat,
      unit: item.u,
    }));

    // Crunch the numbers
    const subtotal = items.reduce((cur, v) => cur + v.total, 0);
    const vat = items.reduce((cur, v) => {
      // Here we count the total amount of tax separated by vat percentage as the keys
      const { vat, total } = v;
      return { ...cur, [vat]: (cur[vat] || 0) + total * vat };
    }, {} as VatIndex);
    const total = subtotal + Object.values(vat).reduce((a, b) => a + b);

    return {
      company,
      client,
      date,
      invoiceNumber,
      items,
      subtotal,
      total,
      vat,
    };
  });

  return invoices;
};
