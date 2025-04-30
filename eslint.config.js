module.exports = {
  ignores: ["node_modules", "dist"], // Substitui o .eslintignore

  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    ecmaVersion: "latest",
    sourceType: "module",
  },

  plugins: {
    "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
  },

  rules: {
    "no-console": "warn",
    "no-unused-vars": "warn",
    "@typescript-eslint/no-unused-vars": ["warn"],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": "off",
  },
};
