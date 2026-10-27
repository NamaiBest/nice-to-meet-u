import { copyFileSync, existsSync } from "node:fs";

const destDir = ".vercel/output/functions/__server.func/_libs";
const files = ["pglite.data", "pglite.wasm", "initdb.wasm"];

if (!existsSync(destDir)) process.exit(0);

for (const name of files) {
  const from = `node_modules/@electric-sql/pglite/dist/${name}`;
  if (!existsSync(from)) continue;
  copyFileSync(from, `${destDir}/${name}`);
  console.log(`[pglite] copied ${name}`);
}
