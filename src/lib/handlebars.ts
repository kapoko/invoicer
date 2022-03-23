import handlebars from "handlebars";
import * as config from "./config";

handlebars.registerHelper("valuta", (num: number) => {
  return `€ ${num.toLocaleString(config.invoice.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
});

handlebars.registerHelper("percentage", (num: number) => `${num * 100}%`);

handlebars.registerHelper("formatDate", (date: Date) =>
  date.toLocaleDateString(config.invoice.locale)
);

export default handlebars;
