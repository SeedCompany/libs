import { parse } from 'yaml';
import { readFile, writeFile } from 'node:fs/promises';
import { globby as glob } from 'globby';

(async () => {
  const files = process.argv[2] ? [process.argv[2]] : await glob(['nx.yaml', './{packages,tools}/*/project.yaml']);
  await Promise.all(files.map(convert));
})();

async function convert(yamlFile: string) {
  let jsonFile = yamlFile.replace(/\.yaml$/, '.json');
  const [src, dest] = await Promise.all([
    readFile(yamlFile, 'utf-8'),
    readFile(jsonFile, 'utf-8').catch(() => null),
  ]);
  let data = parse(src);
  data = { '//': '!! GENERATED! Update yaml sibling file instead !!', ...data };
  let jsonStr = JSON.stringify(data, null, 2);
  if (dest !== jsonStr) {
    console.log('Writing', jsonFile);
    await writeFile(jsonFile, jsonStr);
  }
}
