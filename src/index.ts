#!/usr/bin/env node

import { Command } from "commander";
import { generate, listClients, newInvoice, list, init } from "./commands";
const packageJson = require("../package.json");

const program = new Command();

program
  .name("invoice")
  .description(packageJson.description)
  .version(packageJson.version);

program.command("init").description("create main config file").action(init);

program
  .command("generate")
  .description("generate PDFs from invoice yaml files")
  .option("-f, --force", "generate even if invoices already exists")
  .argument("[invoiceIds...]", "(optional) invoice IDs to generate")
  .action(generate);

program
  .command("new")
  .description("create new invoice data file")
  .action(newInvoice);

program
  .command("list")
  .description("list invoices comma-separated with some useful data")
  .action(list);

program
  .command("clients")
  .description("list clients")
  .option("-c, --csv", "output in .csv format")
  .action(listClients);

program.parse();
