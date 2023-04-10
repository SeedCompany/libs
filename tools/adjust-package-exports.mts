import { readFile, writeFile } from 'node:fs/promises';
import { PackageJson } from 'type-fest';
import { resolve } from 'node:path';

(async () => {
  const dir = resolve('dist');
  const pkg = JSON.parse(await readFile(`${dir}/package.json`, 'utf8'));
  pkg.exports = mapValues(pkg.exports, (exp: Record<PackageJson.ExportCondition, string>) => ({
    import: exp.import.replace(/\/src\//, '/').replace(/.ts$/, '.js'),
    require: exp.require.replace(/\/src\//, '/').replace(/.ts$/, '.cjs'),
    types: exp.types.replace(/\/src\//, '/').replace(/.ts$/, '.d.ts'),
  }))
  await writeFile(`${dir}/package.json`, JSON.stringify(pkg, null, 2), 'utf8');
})();

function mapValues<T, S>(obj: Record<string, T>, fn: (item: T) => S) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value)]),
  );
}
