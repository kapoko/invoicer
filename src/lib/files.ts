import { join, basename } from "path";
import { globSync } from "glob";
import yaml from "js-yaml";
import { readFileSync, appendFileSync, existsSync } from "fs";
import { InvoiceYAML } from "../types";
import handlebars from "./handlebars";
import { getConfig } from "./config";

const appRoot = join(__dirname, "..", "..");

/**
 * Get output dir
 */
const getOutputDirectory = () => {
  const { outDir } = getConfig().invoice;
  return outDir ? outDir : join(appRoot, "generated");
};

/**
 * Get all file paths, or specific ones when invoiceIds is given
 * @returns array of paths
 */
const getInvoicePaths = (invoiceIds: string[] = []) => {
  const files = globSync(
    invoiceIds.length
      ? `${appRoot}/invoices/?(${invoiceIds.join("|")}).yml`
      : `${appRoot}/invoices/*.yml`
  ).sort();

  return files;
};

/**
 * Reads the data from yaml files
 */
const readInvoiceData = (filePaths: string[]) => {
  const data = filePaths.map(
    (f) => yaml.load(readFileSync(f, "utf8")) as InvoiceYAML
  );

  return data;
};

/**
 * @retuns Basenames of all invoice data files
 */
const getAllInvoiceIds = () => {
  const paths = getInvoicePaths();
  return paths.map((p) => basename(p, ".yml"));
};

/**
 * Finds the highest invoice number and returns the next one
 */
const nextInvoiceNumber = () => {
  const ids = getAllInvoiceIds().map((v) => parseInt(v));

  const max = ids.reduce((a, b) => Math.max(a, b), 0);

  return max + 1;
};

/**
 * @returns File path of the newly created invoice
 */
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

  const path = join(appRoot, "invoices", nextInvoiceNumber() + ".yml");
  appendFileSync(path, generatedYaml);

  return path;
};

const copyConfigExample = () => {
  const path = join(appRoot, "config", "config.yml");

  if (existsSync(path)) {
    throw new Error("Config file config.yml already exists.");
  }

  const configExampleYaml = readFileSync(
    join(appRoot, "config", "config.example.yml"),
    "utf8"
  );

  appendFileSync(path, configExampleYaml);

  return path;
};

export {
  getInvoicePaths,
  readInvoiceData,
  getAllInvoiceIds,
  nextInvoiceNumber,
  generateNewInvoiceDataFile,
  getOutputDirectory,
  copyConfigExample,
};
