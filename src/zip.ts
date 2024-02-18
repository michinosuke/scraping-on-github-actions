import fs from "fs";
import path from "path";
import archiver from "archiver";

export const zip = async (dateFileName: string) => {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    const sqlFilePath = path.join(__dirname, `../database/${dateFileName}.sql`);
    const zipFilePath = path.join(__dirname, `../database/${dateFileName}.zip`);

    const outputZipStream = fs.createWriteStream(zipFilePath);
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
  });
};
