import listClientsCommand from "./listClients";
import generateCommand from "./generate";
import newInvoiceCommand from "./newInvoice";
import listCommand from "./list";
import { withErrorHandling } from "../lib/errorHandler";

export const listClients = withErrorHandling(listClientsCommand);
export const generate = withErrorHandling(generateCommand);
export const newInvoice = withErrorHandling(newInvoiceCommand);
export const list = withErrorHandling(listCommand);
