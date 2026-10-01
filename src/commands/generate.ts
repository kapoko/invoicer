import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer, { type PaperFormat } from "puppeteer";
import handlebars from "../lib/handlebars";
import { getConfig } from "../lib/config";
import { getOutputDirectory } from "../lib/files";
import { getInvoices } from "../lib/invoice";
import { getAppRoot } from "../lib/paths";

export default async (
  invoiceIds: string[],
  options: {
    force: boolean | undefined;
  },
) => {
  const config = getConfig();

  if (!invoiceIds.length && options.force) {
    throw new Error("For safety you can't use force flag on all invoices");
  }

  // Get the invoices, all if them if invoiceIds is empty, filter out which should be excluded
  const prefix = config.invoice.onlyGenerateStartingWith?.toString();
  const invoices = getInvoices(invoiceIds).filter(
    (invoice) => !prefix || invoice.invoiceNumber.toString().startsWith(prefix),
  );

  if (!invoices.length) {
    throw new Error("No invoices found.");
  }

  // Launch puppeteer
  const browser = await puppeteer.launch({
    headless: true,
  });

  let count = 0;

  try {
    for await (const invoice of invoices) {
      const dataBinding = { ...invoice, config };
      const fileName = `${config.invoice.prefix}${invoice.invoiceNumber}.pdf`;
      const path = join(getOutputDirectory(), fileName);

      // If generated invoice already exists, don't generate it
      if (!options.force && existsSync(path)) {
        continue;
      }

      mkdirSync(getOutputDirectory(), { recursive: true });

      const templateHtml = readFileSync(
        join(getAppRoot(), "templates", config.invoice.template),
        "utf8",
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

      console.log(`✨ ${path} generated!`);
      count++;
    }
  } catch (e) {
    // Close browser and rethrow
    await browser.close();
    throw e;
  }

  // Close puppeteer
  await browser.close();

  // Result message
  const existing = invoices.length - count;
  const existingMessage = existing
    ? `${existing} invoice(s) already existed.`
    : "";

  console.log(`Done! ${existingMessage}`);
};
