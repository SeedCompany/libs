/** @type {import('@typescript-eslint/utils').TSESLint.Linter.Config} */
const config = {
  root: true,
  plugins: ['@seedcompany'],
  extends: ['plugin:@seedcompany/nestjs'],
};

// eslint-disable-next-line no-undef
module.exports = config;
