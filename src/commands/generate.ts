import { readFileSync, existsSync } from "fs";
import { join } from "path";
import puppeteer, { PaperFormat } from "puppeteer";
import handlebars from "../lib/handlebars";
import { getConfig } from "../lib/config";
import { getOutputDirectory } from "../lib/files";
import { getInvoices } from "../lib/invoice";

const appRoot = join(__dirname, "..", "..");

export default async (
  invoiceIds: string[],
  options: {
    force: boolean | undefined;
  }
) => {
  const config = getConfig();

  if (!invoiceIds.length && options.force) {
    throw new Error("For safety you can't use force flag on all invoices");
  }

  // Get the invoices, all if them if invoiceIds is empty
  const invoices = getInvoices(invoiceIds);

  if (!invoices.length) {
    throw new Error("No invoices found.");
  }

  // Launch puppeteer
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
  });

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
};
