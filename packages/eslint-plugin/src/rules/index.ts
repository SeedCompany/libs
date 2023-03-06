import { rule as noRestrictedImports } from './no-restricted-imports';
import { noUnusedVars } from './no-unused-vars';

export { ImportRestriction } from './no-restricted-imports';

// eslint-disable-next-line import/no-default-export
export default {
  'no-restricted-imports': noRestrictedImports,
  'no-unused-vars': noUnusedVars,
};
