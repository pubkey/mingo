import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import _import from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
      "plugin:import/typescript",
      "plugin:import/errors",
      "plugin:import/warnings",
      "plugin:prettier/recommended"
    )
  ),
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      import: fixupPluginRules(_import),
      "unused-imports": unusedImports
    },

    languageOptions: {
      globals: {},
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: "module",

      parserOptions: {
        project: "./tsconfig.json"
      }
    },

    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "vitest",
              allowImportNames: [
                "afterEach",
                "afterAll",
                "beforeEach",
                "beforeAll",
                "describe",
                "expect",
                "it"
              ]
            }
          ],
          patterns: ["console"]
        }
      ],

      "no-restricted-globals": ["error", "assert"],
      "no-console": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",

      "import/no-cycle": [
        "error",
        {
          maxDepth: "∞"
        }
      ],

      "import/first": "error",
      "sort-imports": "off",
      "import/order": "off",
      "typescript-eslint/no-unsafe-assignment": "off",

      "@typescript-eslint/no-this-alias": [
        "error",
        {
          allowDestructuring: true,
          allowedNames: ["self"]
        }
      ],

      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",

      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ]
    }
  }
];
