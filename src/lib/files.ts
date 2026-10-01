import { join, basename } from "node:path";
import { globSync } from "glob";
import yaml from "js-yaml";
import {
  readFileSync,
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import handlebars from "./handlebars";
import { getConfig } from "./config";
import { validateInvoice } from "./validation";
import {
  getAppRoot,
  getConfigDirectory,
  getDataDirectory,
  getGeneratedDirectory,
  getInvoicesDirectory,
} from "./paths";

/**
 * Get output dir
 */
const getOutputDirectory = () => {
  const { outDir } = getConfig().invoice;
  return outDir ? outDir : getGeneratedDirectory();
};

/**
 * Get all file paths, or specific ones when invoiceIds is given
 * @returns array of paths
 */
const getInvoicePaths = (invoiceIds: string[] = []) => {
  if (invoiceIds.length) {
    return invoiceIds.flatMap((invoiceId) => {
      if (!/^[1-9]\d*$/.test(invoiceId)) {
        throw new Error(`Invoice ID must be a positive integer: ${invoiceId}`);
      }

      const path = join(getInvoicesDirectory(), `${invoiceId}.yml`);
      return existsSync(path) ? [path] : [];
    });
  }

  return globSync(`${getInvoicesDirectory()}/*.yml`).sort();
};

/**
 * Reads the data from yaml files
 */
const readInvoiceData = (filePaths: string[]) => {
  const data = filePaths.map((path) =>
    validateInvoice(yaml.load(readFileSync(path, "utf8")), basename(path)),
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
  const ids = getAllInvoiceIds().map((v) => parseInt(v, 10));

  const max = ids.reduce((a, b) => Math.max(a, b), 0);

  return max + 1;
};

/**
 * @returns File path of the newly created invoice
 */
const generateNewInvoiceDataFile = (clientId?: number) => {
  const templateYaml = readFileSync(
    join(getAppRoot(), "templates", "invoice.yml"),
    "utf8",
  );

  const template = handlebars.compile(templateYaml);

  // Fill in date of today
  const generatedYaml = template({
    date: new Date().toISOString().substring(0, 10),
    clientId,
  });

  mkdirSync(getInvoicesDirectory(), { recursive: true });
  let invoiceNumber = nextInvoiceNumber();

  while (true) {
    const path = join(getInvoicesDirectory(), `${invoiceNumber}.yml`);

    try {
      writeFileSync(path, generatedYaml, { flag: "wx" });
      return path;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        throw error;
      }

      invoiceNumber++;
    }
  }
};

const copyConfigExample = () => {
  const path = join(getConfigDirectory(), "config.yml");

  if (existsSync(path)) {
    throw new Error("Config file config.yml already exists.");
  }

  mkdirSync(getConfigDirectory(), { recursive: true });

  const legacyDirectory = getAppRoot();
  const legacyConfigPath = join(legacyDirectory, "config", "config.yml");
  if (existsSync(legacyConfigPath)) {
    copyFileSync(legacyConfigPath, path);

    for (const directory of ["invoices", "generated"]) {
      const legacyPath = join(legacyDirectory, directory);
      if (existsSync(legacyPath)) {
        cpSync(legacyPath, join(getDataDirectory(), directory), {
          recursive: true,
          errorOnExist: true,
        });
      }
    }

    return path;
  }

  const configExampleYaml = readFileSync(
    join(getAppRoot(), "config", "config.example.yml"),
    "utf8",
  );

  writeFileSync(path, configExampleYaml, { flag: "wx" });

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
