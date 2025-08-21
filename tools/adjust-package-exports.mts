import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

(async () => {
  const dir = resolve('dist');
  const pkg = JSON.parse(await readFile(`${dir}/package.json`, 'utf8'));
  pkg.exports = mapValues(pkg.exports, (exp: Partial<Record<string, string>>) =>
    Object.fromEntries(Object.entries(({
      types: exp.types?.replace(/\/src\//, '/').replace(/(?<!\.d).ts$/, '.d.ts'),
      import: exp.import?.replace(/\/src\//, '/').replace(/\.ts$/, '.js'),
      default: exp.default?.replace(/\/src\//, '/').replace(/\.ts$/, '.js'),
      require: exp.require?.replace(/\/src\//, '/').replace(/\.ts$/, '.cjs'),
    })).map(([key, value]) => value ? [key, value] : []))
  );
  await writeFile(`${dir}/package.json`, JSON.stringify(pkg, null, 2), 'utf8');
})();

function mapValues<T, S>(obj: Record<string, T>, fn: (item: T) => S) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value)]),
  );
}
