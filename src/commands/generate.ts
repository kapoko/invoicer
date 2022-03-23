import { readFileSync } from "fs";
import { join, basename } from "path";
import glob from "glob";
import puppeteer, { PaperFormat } from "puppeteer";
import handlebars from "../lib/handlebars";
import * as config from "../lib/config";
import yaml from "js-yaml";
import { InvoiceData, InvoiceDataItem, InvoiceYAML } from "../types";

const appRoot = join(__dirname, "..", "..");

const getInvoices = () => {
  // Read files
  const files = glob.sync(`${appRoot}/invoices/*.yml`);
  const data = files.map(
    (f) => yaml.load(readFileSync(f, "utf8")) as InvoiceYAML
  );

  const invoices: InvoiceData[] = data.map((inv, index) => {
    // Date
    const date = inv.date;
    const { company } = config;

    // Invoice number, check if filename is a number
    const invoiceNumber = parseInt(basename(files[index], ".yml"));
    if (isNaN(invoiceNumber)) {
      throw new Error(`Invoice file ${basename(files[index])} is not numeric.`);
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
      vat: item.v || config.invoice.defaultVat,
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

export default () => {
  try {
    (async () => {
      // Launch puppeteer
      const browser = await puppeteer.launch({
        args: ["--no-sandbox"],
        headless: true,
      });

      // Generate each invoice
      for await (const invoice of getInvoices()) {
        const dataBinding = { ...invoice, config };
        const fileName = `${config.invoice.prefix}${invoice.invoiceNumber}.pdf`;

        const templateHtml = readFileSync(
          join(appRoot, "templates", config.invoice.template),
          "utf8"
        );
        const template = handlebars.compile(templateHtml);
        const finalHtml = encodeURIComponent(template(dataBinding));
        const options = {
          format: "a4" as PaperFormat,
          printBackground: true,
          path: join(appRoot, "generated", fileName),
        };

        const page = await browser.newPage();
        await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
          waitUntil: "networkidle0",
        });
        await page.pdf(options);

        console.log(`✨ ${fileName} is created!`);
      }

      // Close puppeteer
      await browser.close();
    })();
  } catch (e) {
    console.error(e);
  }
};
