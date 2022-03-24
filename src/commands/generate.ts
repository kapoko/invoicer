import { readFileSync, existsSync } from "fs";
import { join, basename } from "path";
import puppeteer, { PaperFormat } from "puppeteer";
import handlebars from "../lib/handlebars";
import * as config from "../lib/config";
import { InvoiceData, InvoiceDataItem } from "../types";
import {
  readInvoiceData,
  getInvoicePaths,
  getOutputDirectory,
} from "../lib/files";

const appRoot = join(__dirname, "..", "..");

const getInvoices = (invoiceIds: string[] = []) => {
  const invoicePaths = getInvoicePaths(invoiceIds);
  const data = readInvoiceData(invoicePaths);

  const invoices: InvoiceData[] = data.map((inv, index) => {
    // Date
    const date = inv.date;
    const { company } = config;

    // Invoice number, check if filename is a number
    const invoiceNumber = parseInt(basename(invoicePaths[index], ".yml"));
    if (isNaN(invoiceNumber)) {
      throw new Error(
        `Invoice file ${basename(invoicePaths[index])} is not numeric.`
      );
    }

    // Find client, throw error if it doesn't exist
    const client = config.clients.find((c) => c.id === inv.to);
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
      vat: item.v || item.v === 0 ? item.v : config.invoice.defaultVat,
      unit: item.u,
    }));

    // Crunch the numbers
    const subtotal = items.reduce((cur, v) => cur + v.total, 0);
    const vat = items.reduce((cur, v) => {
      // Here we count the total amount of tax separated by vat percentage as the keys
      const { vat, total } = v;
      return { ...cur, [vat]: (cur[vat] || 0) + total * vat };
    }, {} as { [key: number]: number });
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

export default async (
  invoiceIds: string[],
  options: {
    force: boolean | undefined;
  }
) => {
  try {
    // Launch puppeteer
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      headless: true,
    });

    // Loop over invoices, all if them if no invoiceIds are given
    const invoices = getInvoices(invoiceIds);

    let count = 0;

    for await (const invoice of invoices) {
      const dataBinding = { ...invoice, config };
      const fileName = `${config.invoice.prefix}${invoice.invoiceNumber}.pdf`;
      const path = join(getOutputDirectory(), fileName);

      // If generated invoice already exists, don't generate it
      if (!options.force && existsSync(path)) {
        continue;
      }

      const templateHtml = readFileSync(
        join(appRoot, "templates", config.invoice.template),
        "utf8"
      );
      const template = handlebars.compile(templateHtml);
      const finalHtml = encodeURIComponent(template(dataBinding));
      const pdfOptions = {
        format: "a4" as PaperFormat,
        printBackground: true,
        path,
      };

      const page = await browser.newPage();
      await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
        waitUntil: "networkidle0",
      });
      await page.pdf(pdfOptions);

      console.log(`✨ ${fileName} created!`);
      count++;
    }

    // Close puppeteer
    await browser.close();

    // Result message
    const existing = invoices.length - count;
    const existingMessage = existing
      ? `${existing} invoice(s) already existed.`
      : "";

    console.log("Done! " + existingMessage);
  } catch (e) {
    console.error(e);
  }
};
