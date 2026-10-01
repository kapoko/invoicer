import { generateNewInvoiceDataFile } from "../lib/files";
import { getConfig } from "../lib/config";

export default (clientId?: string) => {
  let clientIdNumber: number | undefined;

  if (clientId !== undefined) {
    clientIdNumber = Number(clientId);
    if (!Number.isInteger(clientIdNumber)) {
      throw new Error(`Client ID must be an integer: ${clientId}`);
    }

    if (!getConfig().clients.some((client) => client.id === clientIdNumber)) {
      throw new Error(`Client with id ${clientIdNumber} doesn't exist`);
    }
  }

  const path = generateNewInvoiceDataFile(clientIdNumber);

  console.log(`✨ New invoice created! ${path}`);
};
