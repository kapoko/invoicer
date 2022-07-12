import listClientsCommand from "./listClients";
import generateCommand from "./generate";
import newInvoiceCommand from "./newInvoice";
import listCommand from "./list";
import initCommand from "./init";
import getPathCommand from "./getPath";
import { withErrorHandling } from "../lib/errorHandler";

export const listClients = withErrorHandling(listClientsCommand);
export const generate = withErrorHandling(generateCommand);
export const newInvoice = withErrorHandling(newInvoiceCommand);
export const list = withErrorHandling(listCommand);
export const init = withErrorHandling(initCommand);
export const getPath = withErrorHandling(getPathCommand);
