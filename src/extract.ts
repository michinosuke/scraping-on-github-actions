import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { format } from "date-fns";
import { execSync } from "child_process";
import { zip } from "./zip";
import { join } from "path";
import { readdirSync, existsSync } from "fs";
import jsdom from "jsdom";
const { JSDOM } = jsdom;
import admZip from "adm-zip";

const main = async () => {
  const sqlitePath = join(__dirname, "../prisma/database.sqlite");
  const databaseDirPath = join(__dirname, "../database");
  const shouldExtractZipPaths = readdirSync(databaseDirPath)
    .map((x) => join(databaseDirPath, x)) // とりまフルパスにする
    .filter((x) => {
      // .zip じゃない（.sql）はスキップ
      if (x.match(/\.zip$/) === null) return false;
      // すでに解凍済みで .sql が存在する場合もスキップ
      if (existsSync(x.replace(".zip", ".sql"))) return false;
      return true;
    });

  if (shouldExtractZipPaths.length === 0) {
    console.log("[warn] 解答が必要な zip ファイルは存在しません。");
  }

  for (const zipPath of shouldExtractZipPaths) {
    const zip = new admZip(zipPath);
    console.log(`[extracting...] ${zipPath}`);
    zip.extractAllTo(databaseDirPath);
  }

  const shouldImportSqlPaths = readdirSync(databaseDirPath)
    .map((x) => join(databaseDirPath, x)) // とりまフルパスにする
    .filter((x) => x.match(/\.sql$/));

  if (shouldImportSqlPaths.length === 0) {
    console.log(
      "[error] SQL ファイルが存在しません。database ディレクトリに zip ファイルが存在しません。"
    );
    return;
  }

  // 主キー制約に引っかかるので、すでにあるデータベースは削除する
  execSync(`rm ${sqlitePath}`);

  for (const sqlPath of shouldImportSqlPaths) {
    const cmd = `sqlite3 ${sqlitePath} < ${sqlPath}`;
    console.log(`[importing...] ${cmd}`);
    execSync(cmd);
  }

  console.log(
    "[fin] データベースにすべての zip ファイルをインポートしました。"
  );
};

main();
