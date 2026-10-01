import { join } from "node:path";
import { readFileSync } from "node:fs";
import yaml, { YAMLException } from "js-yaml";
import type { Config } from "../types";
import { validateConfig } from "./validation";
import { getConfigDirectory } from "./paths";

let config: Config | undefined;

export const getConfig = () => {
  if (config) return config;

  try {
    config = validateConfig(
      yaml.load(readFileSync(join(getConfigDirectory(), "config.yml"), "utf8")),
    );

    return config;
  } catch (e) {
    if (e instanceof YAMLException) {
      throw new Error(`Config file has bad formatting:\n${e.message}`);
    }

    throw new Error("Config file doesn't exist. Run invoice init");
  }
};
