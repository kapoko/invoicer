import handlebars from "handlebars";
import { getConfig } from "./config";
import currencies from "../currencies.json";
import { Currency } from "../types";

handlebars.registerHelper("valuta", (num: number, cur: Currency) => {
  const { locale, defaultCurrency } = getConfig().invoice;

  const currency = typeof cur === "string" ? cur : defaultCurrency;

  if (!currencies[currency]) {
    throw new Error(`${currency} is not a known currency.`);
  }

  const symbol = currencies[currency].symbol;

  const amount = num.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol} ${amount}`;
});

handlebars.registerHelper("percentage", (num: number) => `${num * 100}%`);

handlebars.registerHelper("formatDate", (date: Date) =>
  date.toLocaleDateString(getConfig().invoice.locale)
);

export default handlebars;
