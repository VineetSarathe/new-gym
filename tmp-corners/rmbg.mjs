import { writeFile } from "node:fs/promises";
import { removeBackground } from "@imgly/background-removal-node";

const src = process.argv[2];
const dest = process.argv[3];

const blob = await removeBackground(src, {
    output: { format: "image/png", quality: 1 },
});
const buffer = Buffer.from(await blob.arrayBuffer());
await writeFile(dest, buffer);
console.log("wrote", dest, buffer.length);
