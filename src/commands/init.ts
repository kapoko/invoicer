import { copyConfigExample } from "../lib/files";

export default () => {
  const path = copyConfigExample();

  console.log(`✨ Config created! ${path}`);
};
