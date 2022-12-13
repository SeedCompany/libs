import { Plugin, Rule } from '@commitlint/types';
import { readdirSync } from 'fs';
import { join } from 'path';

const optionalTypes = new Set(['build', 'chore', 'ci', 'docs']);

const scope: Rule<string[]> = ({ scope, type }, _, extraScopes = []) => {
  const packages = readdirSync(join(__dirname, '../../../packages'));
  const scopes = extraScopes.concat(packages);
  if (type && optionalTypes.has(type)) return [true, ''];
  return [
    Boolean(scope && scopes.includes(scope)),
    `scope must be one of [${scopes.join(', ')}]`,
  ];
};

const plugin: Plugin = {
  rules: {
    'scope-enum': scope,
  },
};

module.exports = plugin;
