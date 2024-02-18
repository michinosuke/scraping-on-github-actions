import { existsSync } from "fs";
import { execSync } from "child_process";
import { variables } from "./variables";

// date はデフォルトで現在の時刻ですが、overrideDate を渡して上書きすることができます。
export const preScraping = async (overrideDate?: string) => {
  const { sqlitePath, zipFilePath, date } = variables(overrideDate);

  execSync(`rm -f ${sqlitePath}`);
  execSync("prisma db push");
  execSync("prisma generate");

  // すでに取得済みだったら処理を終了する
  if (existsSync(zipFilePath)) {
    throw new Error(`すでに取得済みなので処理を終了します。`);
  }

  return { date };
};
