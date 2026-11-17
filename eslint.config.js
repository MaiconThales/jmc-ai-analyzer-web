// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const sonarjs = require("eslint-plugin-sonarjs");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    ignores: ["src/app/core/api/generated/**"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strict,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      sonarjs.configs.recommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": ["error", { type: "attribute", prefix: "app", style: "camelCase" }],
      "@angular-eslint/component-selector": ["error", { type: "element", prefix: "app", style: "kebab-case" }],
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": "error",
      "sonarjs/cognitive-complexity": ["error", 15],
      "@typescript-eslint/no-extraneous-class": ["error", { allowWithDecorator: true }],
    },
  },
  {
    files: ["**/*.spec.ts", "src/testing/**/*.ts", "e2e/**/*.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "sonarjs/no-hardcoded-ip": "off",
      "sonarjs/no-duplicate-string": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  },
);
