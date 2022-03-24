import { join, basename } from "path";
import glob from "glob";
import yaml from "js-yaml";
import { readFileSync, appendFileSync } from "fs";
import { InvoiceYAML } from "../types";
import handlebars from "./handlebars";
import * as config from "./config";

const appRoot = join(__dirname, "..", "..");

// Get output dir
const getOutputDirectory = () => {
  return config.invoice.outDir
    ? config.invoice.outDir
    : join(appRoot, "generated");
};

// Get all file paths, or specific ones when invoiceIds is given
const getInvoicePaths = (invoiceIds: string[] = []) => {
  const files = glob.sync(
    invoiceIds.length
      ? `${appRoot}/invoices/?(${invoiceIds.join("|")}).yml`
      : `${appRoot}/invoices/*.yml`
  );

  return files;
};

// Reads the data from yaml files
const readInvoiceData = (filePaths: string[]) => {
  const data = filePaths.map(
    (f) => yaml.load(readFileSync(f, "utf8")) as InvoiceYAML
  );

  return data;
};

// Returns basenames of all invoice data files
const getAllInvoiceIds = () => {
  const paths = getInvoicePaths();
  return paths.map((p) => basename(p, ".yml"));
};

// Finds the highest invoice number and returns the next one
const nextInvoiceNumber = () => {
  const ids = getAllInvoiceIds().map((v) => parseInt(v));

  const max = ids.reduce(function (a, b) {
    return Math.max(a, b);
  }, -Infinity);

  return max + 1;
};

const generateNewInvoiceDataFile = () => {
  const templateYaml = readFileSync(
    join(appRoot, "templates", "invoice.yml"),
    "utf8"
  );

  const template = handlebars.compile(templateYaml);

  // Fill in date of today
  const generatedYaml = template({
    date: new Date().toISOString().substring(0, 10),
  });

  const newInvoice = nextInvoiceNumber() + ".yml";
  appendFileSync(join(appRoot, "invoices", newInvoice), generatedYaml);

  return newInvoice;
};

export {
  getInvoicePaths,
  readInvoiceData,
  getAllInvoiceIds,
  nextInvoiceNumber,
  generateNewInvoiceDataFile,
  getOutputDirectory,
};
