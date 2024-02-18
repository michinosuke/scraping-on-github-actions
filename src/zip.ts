import fs from "fs";
import path from "path";
import archiver from "archiver";

export const zip = async (dateFileName: string) => {
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  const sqlFilePath = path.join(__dirname, `../database/${dateFileName}.sql`);
  const zipFilePath = path.join(__dirname, `../database/${dateFileName}.zip`);

  const outputZipStream = fs.createWriteStream(zipFilePath);
  outputZipStream.on("close", () => {
    console.log(`[done] ${sqlFilePath} → ${zipFilePath}`);
  });
  archive.on("error", (err) => {
    throw err;
  });

  archive.file(sqlFilePath, { name: `${dateFileName}.sql` });
  archive.pipe(outputZipStream);
  await archive.finalize();

  console.log("finalize");
};
