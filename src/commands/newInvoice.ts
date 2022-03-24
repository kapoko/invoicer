import { generateNewInvoiceDataFile, nextInvoiceNumber } from "../lib/files";

export default () => {
  const filename = generateNewInvoiceDataFile();

  console.log(`✨ ${filename} created!`);
};
