import { dirname, join } from "path";
import { readFileSync } from "fs";
import yaml from "js-yaml";
import { Config } from "../types";

const configPath = join(__dirname, "..", "..", "config");

const getConfig = () => {
  const config = yaml.load(
    readFileSync(join(configPath, "config.yml"), "utf8")
  ) as Config;

  return config;
};

export const { clients, company, invoice } = getConfig();
