import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { format } from "date-fns";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const prisma = new PrismaClient();

const main = async () => {
  // 今日の日付
  const date = format(new Date(), "yyyy-MM-dd");

  // すでに取得済みだったら処理を終了する
  const exist = await prisma.wikipedia.findUnique({ where: { date } });
  if (exist) {
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
};

main();
