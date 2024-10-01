import globals from "globals";
import pluginJs from "@eslint/js";
import * as pluginJest from "eslint-plugin-jest";

export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.node }},{
    files: ["**/*.test.js", "**/*.spec.js"], // Target test files
    languageOptions: {
      globals: globals.jest, // Include Jest globals like beforeAll, test, etc.
    },
    plugins: {
      jest: pluginJest, // Use the Jest plugin
    }},
  pluginJs.configs.recommended,
];