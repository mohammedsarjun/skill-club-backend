
import archiver from "archiver";
import axios from "axios";

interface FileToZip {
  url: string;
  path: string; // filename inside ZIP
}

export function createZipStream(files: FileToZip[]) {
  const archive = archiver("zip", { zlib: { level: 9 } });

  (async () => {
    for (const file of files) {
      const response = await axios.get(file.url, { responseType: "stream" });
      archive.append(response.data, { name: file.path });
    }
    await archive.finalize();
  })();

  return archive;
}
