import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { format } from "date-fns";
import { execSync } from "child_process";
import { zip } from "./zip";
import { join } from "path";
import { existsSync } from "fs";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const getFormatStr = (): string => {
  const intervalUnit = process.env.INTERVAL_UNIT;
  assertIntervalUnit(intervalUnit);
  switch (intervalUnit) {
    case "year":
      return "yyyy";
    case "month":
      return "yyyy-MM";
    case "date":
      return "yyyy-MM-dd";
    case "hour":
      return "yyyy-MM-dd HH";
    case "minute":
      return "yyyy-MM-dd HH:mm";
    case "second":
      return "yyyy-MM-dd HH:mm:ss";
  }
};

// タイムスタンプ
const formatStr = getFormatStr();
const date = format(new Date(), formatStr);
const dateFileName = date.replace(" ", "_").replace(/:/g, "-");
const sqlitePath = join(__dirname, "../prisma/database.sqlite");
const sqlFilePath = join(__dirname, `../database/${dateFileName}.sql`);

execSync(`rm -f ${sqlitePath}`);
execSync("prisma db push");
execSync("prisma generate");

const prisma = new PrismaClient();

function assertIntervalUnit(
  s: string | undefined
): asserts s is "year" | "month" | "date" | "hour" | "minute" | "second" {
  if (
    s === undefined ||
    ["year", "month", "date", "hour", "minute", "second"].includes(s) === false
  ) {
    throw new Error(
      "環境変数 INTERVAL_UNIT は year, month, date, hour, minute, second のいずれかである必要があります。"
    );
  }
}

const main = async () => {
  // すでに取得済みだったら処理を終了する
  if (existsSync(sqlFilePath)) {
    console.log(`すでに取得済みなので処理を終了します。`);
    return;
  }

  const url = "https://en.wikipedia.org/";
  const { data } = await axios.get(url);
  const { document } = new JSDOM(data).window;
  const countStr = document.querySelector(
    'a[title="Special:Statistics"]'
  )?.innerHTML;
  if (!countStr) throw new Error("Failed retrieve statistics.");
  const count = Number(countStr.replace(/,/g, ""));
  if (typeof count !== "number") throw new Error();

  // データを保存する
  const result = await prisma.wikipedia.create({ data: { date, count } });
  console.log(`[保存完了] ${result.date} ${result.count}`);

  console.log(`sqlite3 ${sqlitePath} .dump > ${sqlFilePath}`);
  execSync(`sqlite3 ${sqlitePath} .dump > ${sqlFilePath}`);
  await zip(dateFileName);

  await new Promise((resolve) => setTimeout(resolve, 10_000));
};

main();
