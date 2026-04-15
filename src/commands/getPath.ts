import { join } from "node:path";

export default () => {
  const appDir = join(__dirname, "../../");

  console.log(appDir);
};
