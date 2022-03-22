#!/usr/bin/env node

import { Command } from "commander";
import { generate, listClients } from "./commands";
const packageJson = require("../package.json");

const program = new Command();

program
  .name("invoice")
  .description(packageJson.description)
  .version(packageJson.version);

program
  .command("generate", { isDefault: true })
  .description("(default) Generate invoices")
  .action(generate);

program.command("clients").description("List clients").action(listClients);

program.parse();
