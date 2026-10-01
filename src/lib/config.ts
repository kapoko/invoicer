import { join } from "node:path";
import { readFileSync } from "node:fs";
import * as yaml from "js-yaml";
import { YAMLException } from "js-yaml";
import type { Config } from "../types.js";
import { validateConfig } from "./validation.js";
import { getDataDirectory } from "./paths.js";

let config: Config | undefined;

export const getConfig = () => {
  if (config) return config;

  try {
    config = validateConfig(
      yaml.load(readFileSync(join(getDataDirectory(), "config.yml"), "utf8")),
    );

    return config;
  } catch (e) {
    if (e instanceof YAMLException) {
      throw new Error(`Config file has bad formatting:\n${e.message}`);
    }

    throw new Error("Config file doesn't exist. Run invoice init");
  }
};
