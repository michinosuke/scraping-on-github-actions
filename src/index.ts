import { preScraping } from "./pre-scraping";
import { postScraping } from "./post-scraping";

import { PrismaClient } from "@prisma/client";
import axios from "axios";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const main = async () => {
  // ---- preScraping は必ず実行してください ----
  // date は INTERVAL_UNIT に応じた現在のタイムスタンプです
  const { date } = await preScraping();
  // ----------------------------------------

  // ↓↓↓↓ ここから下をカスタマイズしてください。↓↓↓↓
  const prisma = new PrismaClient();
  const url = "https://en.wikipedia.org/";
  const { data } = await axios.get(url);
  const { document } = new JSDOM(data).window;
  const countStr = document.querySelector(
    'a[title="Special:Statistics"]'
  )?.innerHTML;
  if (!countStr) throw new Error("Failed retrieve statistics.");
  const count = Number(countStr.replace(/,/g, ""));
  if (typeof count !== "number") throw new Error();
  // データを SQLite に保存する
  await prisma.wikipedia.create({ data: { date, count } });
  // ↑↑↑↑ ここから上をカスタマイズしてください ↑↑↑↑

  // ---- postScraping は必ず実行してください ----
  await postScraping();
  // -----------------------------------------
};

main();
