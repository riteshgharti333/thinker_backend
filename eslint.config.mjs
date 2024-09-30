import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  { 
    files: ["**/*.js"], 
    languageOptions: { 
      sourceType: "commonjs",
      globals: {
        ...globals.browser,
        ...globals.node, // Add Node.js globals here
      },
    } 
  },
  pluginJs.configs.recommended,
];
