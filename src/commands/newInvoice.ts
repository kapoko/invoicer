import { generateNewInvoiceDataFile } from "../lib/files";

export default () => {
  const path = generateNewInvoiceDataFile();

  console.log(`✨ New invoice created! ${path}`);
};
