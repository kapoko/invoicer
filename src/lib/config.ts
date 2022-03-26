import { join } from "path";
import { readFileSync } from "fs";
import yaml from "js-yaml";
import { Config } from "../types";

const configPath = join(__dirname, "..", "..", "config");

export const getConfig = () => {
  try {
    const config = yaml.load(
      readFileSync(join(configPath, "config.yml"), "utf8")
    ) as Config;

    return config;
  } catch (e) {
    throw new Error("Config file doens't exist. Run invoice init");
  }
};
