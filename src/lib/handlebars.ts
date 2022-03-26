import handlebars from "handlebars";
import { getConfig } from "./config";

handlebars.registerHelper("valuta", (num: number) => {
  return `€ ${num.toLocaleString(getConfig().invoice.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
});

handlebars.registerHelper("percentage", (num: number) => `${num * 100}%`);

handlebars.registerHelper("formatDate", (date: Date) =>
  date.toLocaleDateString(getConfig().invoice.locale)
);

export default handlebars;
