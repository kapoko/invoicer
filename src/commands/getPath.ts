import { join } from "path";

export default () => {
  const appDir = join(__dirname, "../../");

  console.log(appDir);
};
