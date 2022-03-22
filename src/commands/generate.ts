import { readFileSync } from "fs";
import { join } from "path";
import puppeteer, { PaperFormat } from "puppeteer";
import handlebars from "handlebars";
import { company, clients } from "../config";

handlebars.registerHelper("valuta", (num: number) => {
  return `€ ${num.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
});

handlebars.registerHelper("percentage", (num: number) => {
  return `${num * 100}%`;
});

const items = [
  {
    name: "Item",
    price: 100,
    amount: 1,
  },
  {
    name: "Web development",
    price: 62.5,
    amount: 8,
    unit: "uur",
    description: `
      25/11 20:00 - 22:00 (2) Server prepation, mirror old site on server<br />
      26/11 07:00 - 11:00 (4) Merge changes into repo, going live, checkups<br /> 
      30/11 14:00 - 15:00 (1) Fix bug on logout<br />
      02/12 12:00 - 13:00 (1) www redirect<br />
      02/12 21:30 - 22:00 (0,5) Css version fix`,
  },
  {
    name: "Another item",
    price: 289.75,
    amount: 1,
  },
].map((i) => {
  return { total: i.amount * i.price, ...i };
});

const subtotal = items.reduce((cur, v) => cur + v.total, 0);
const vat = 0.21;
const tax = subtotal * vat;
const total = subtotal * (1 + vat);

export default () => {
  try {
    (async () => {
      var dataBinding = {
        invoiceNumber: 22126,
        date: `${new Date().getDate()}/${
          new Date().getMonth() + 1
        }/${new Date().getFullYear()}`,
        items,
        subtotal,
        vat,
        total,
        tax,
        company,
        client: clients[0],
      };

      var templateHtml = readFileSync(
        join(process.cwd(), "templates", "invoice.html"),
        "utf8"
      );
      var template = handlebars.compile(templateHtml);
      var finalHtml = encodeURIComponent(template(dataBinding));
      var options = {
        format: "a4" as PaperFormat,
        printBackground: true,
        path: `invoices/${Date.now()}-invoice.pdf`,
      };

      const browser = await puppeteer.launch({
        args: ["--no-sandbox"],
        headless: true,
      });
      const page = await browser.newPage();
      await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
        waitUntil: "networkidle0",
      });
      await page.pdf(options);
      await browser.close();

      console.log("Done: invoice.pdf is created!");
    })();
  } catch (e) {
    console.log("ERROR:", e);
  }
};
