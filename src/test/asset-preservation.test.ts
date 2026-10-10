// @vitest-environment node
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import baseline from "./fixtures/asset-baseline.json";

/**
 * Guards the brand's existing media (see docs/asset-inventory.md). A failure here means an
 * image, film, poster or asset manifest was deleted, renamed or replaced. If a change is
 * intentional and approved, regenerate src/test/fixtures/asset-baseline.json in the same
 * commit so the replacement is explicit in review.
 */
const root = process.cwd();
const sha256 = (buf: Buffer) => createHash("sha256").update(buf).digest("hex");

describe("asset preservation", () => {
  it.each(Object.entries(baseline.files))("%s is unchanged", (file, hash) => {
    expect(sha256(readFileSync(join(root, file)))).toBe(hash);
  });

  it("keeps every product photograph in place", () => {
    const dir = join(root, baseline.productPhotos.dir);
    const names = readdirSync(dir).sort();
    expect(names.length).toBe(baseline.productPhotos.count);
    expect(sha256(Buffer.from(names.join("\n")))).toBe(baseline.productPhotos.namesSha256);
    const total = names.reduce((sum, n) => sum + statSync(join(dir, n)).size, 0);
    expect(total).toBe(baseline.productPhotos.totalBytes);
  });

  it("homepage still references all 13 campaign assets and both films", () => {
    const home = readFileSync(join(root, "src/routes/index.tsx"), "utf8");
    const imports = home.match(/from "@\/assets\/[^"]+\.asset\.json"/g) ?? [];
    expect(imports).toHaveLength(13);
    for (const film of ["miravika-signature", "miravika-rakhi"]) {
      expect(home).toContain(`/video/${film}.mp4`);
      expect(home).toContain(`/video/${film}-poster.jpg`);
    }
  });
});
