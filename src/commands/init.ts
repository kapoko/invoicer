import { copyConfigExample } from "../lib/files.js";

export default () => {
  const path = copyConfigExample();

  console.log(`✨ Config created! ${path}`);
};
