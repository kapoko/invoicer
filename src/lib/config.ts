import { join } from "path";
import { readFileSync } from "fs";
import yaml, { YAMLException } from "js-yaml";
import { Config } from "../types";

const configPath = join(__dirname, "..", "..", "config");

let config: Config | undefined;

export const getConfig = () => {
  if (config) return config;

  try {
    config = yaml.load(
      readFileSync(join(configPath, "config.yml"), "utf8")
    ) as Config;

    return config;
  } catch (e) {
    if (e instanceof YAMLException) {
      throw new Error(`Config file has bad formatting:\n${e.message}`);
    }

    throw new Error("Config file doens't exist. Run invoice init");
  }
};
