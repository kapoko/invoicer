import listClientsCommand from "./listClients";
import generateCommand from "./generate";
import newInvoiceCommand from "./newInvoice";
import { withErrorHandling } from "../lib/errorHandler";

export const listClients = withErrorHandling(listClientsCommand);
export const generate = withErrorHandling(generateCommand);
export const newInvoice = withErrorHandling(newInvoiceCommand);
