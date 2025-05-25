import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  js.configs.recommended, // Add base ESLint recommended rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Custom rule overrides
    rules: {
      "@typescript-eslint/no-explicit-any": "off",       // Disable 'any' warnings
      "@typescript-eslint/no-unused-vars": "off",       // Disable unused variables
      "no-unused-vars": "off"                           // Disable JS unused vars (if needed)
    }
  }
];

export default eslintConfig;