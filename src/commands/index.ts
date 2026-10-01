import listClientsCommand from "./listClients.js";
import generateCommand from "./generate.js";
import newInvoiceCommand from "./newInvoice.js";
import listCommand from "./list.js";
import initCommand from "./init.js";
import getPathCommand from "./getPath.js";
import { withErrorHandling } from "../lib/errorHandler.js";

export const listClients = withErrorHandling(listClientsCommand);
export const generate = withErrorHandling(generateCommand);
export const newInvoice = withErrorHandling(newInvoiceCommand);
export const list = withErrorHandling(listCommand);
export const init = withErrorHandling(initCommand);
export const getPath = withErrorHandling(getPathCommand);
