import { execSync } from "child_process";
import { zip } from "./zip";
import { join } from "path";
import { variables } from "./variables";

export const postScraping = async () => {
  const { dateFileName, sqlitePath } = variables();

  const sqlFilePath = join(__dirname, `../database/${dateFileName}.sql`);

  console.log(`sqlite3 ${sqlitePath} .dump > ${sqlFilePath}`);
  execSync(`sqlite3 ${sqlitePath} .dump > ${sqlFilePath}`);
  await zip(dateFileName);
};
