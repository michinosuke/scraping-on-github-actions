import { existsSync, createWriteStream } from "fs";
import path from "path";
import archiver from "archiver";

export const zip = async (dateFileName: string) => {
  return new Promise((resolve, reject) => {
    const sqlFilePath = path.join(__dirname, `../database/${dateFileName}.sql`);
    const zipFilePath = path.join(__dirname, `../database/${dateFileName}.zip`);

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    const outputZipStream = createWriteStream(zipFilePath);

    outputZipStream.on("close", () => {
      console.log(`[done] ${sqlFilePath} → ${zipFilePath}`);
      resolve({ zipFilePath });
    });
    archive.on("error", (err) => {
      reject(err);
    });

    archive.file(sqlFilePath, { name: `${dateFileName}.sql` });
    archive.pipe(outputZipStream);
    archive.finalize();

    const intervalId = setInterval(() => {
      if (existsSync(zipFilePath)) {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        resolve({ zipFilePath });
      }
    }, 10);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      reject("zip timeout");
    }, 3_000);
  });
};
