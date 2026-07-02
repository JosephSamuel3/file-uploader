import fs from "fs";

fs.cpSync("src/views", "dist/views", { recursive: true });
fs.cpSync("src/public", "dist/public", { recursive: true });
