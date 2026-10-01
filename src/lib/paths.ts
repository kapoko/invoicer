import { homedir } from "node:os";
import { join } from "node:path";

const appRoot = join(__dirname, "..", "..");

export const getAppRoot = () => appRoot;

export const getDataDirectory = () => {
  const configuredDirectory = process.env.LIL_INVOICER_DATA_DIR;
  if (configuredDirectory) return configuredDirectory;

  if (process.platform === "darwin") {
    return join(homedir(), "Library", "Application Support", "lil-invoicer");
  }
  if (process.platform === "win32") {
    return join(
      process.env.APPDATA || join(homedir(), "AppData", "Roaming"),
      "lil-invoicer",
    );
  }

  return join(
    process.env.XDG_DATA_HOME || join(homedir(), ".local", "share"),
    "lil-invoicer",
  );
};

export const getInvoicesDirectory = () => join(getDataDirectory(), "invoices");
export const getGeneratedDirectory = () =>
  join(getDataDirectory(), "generated");
