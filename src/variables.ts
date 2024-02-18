import { format } from "date-fns";
import { join } from "path";

export const variables = (overrideDate?: string) => {
  const date = (() => {
    if (overrideDate) return overrideDate;
    const formatStr = getFormatStr();
    return format(new Date(), formatStr);
  })();
  const dateFileName = date.replace(" ", "_").replace(/:/g, "-");
  const sqlitePath = join(__dirname, "../prisma/database.sqlite");
  const zipFilePath = join(__dirname, `../database/${dateFileName}.zip`);

  return {
    date,
    dateFileName,
    sqlitePath,
    zipFilePath,
  };
};

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
