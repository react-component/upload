const base = require("@umijs/fabric/dist/eslint");

module.exports = {
  ...base,
  rules: {
    ...base.rules,
    "react/no-array-index-key": 0,
    "react/sort-comp": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-empty-interface": 0,
    "@typescript-eslint/no-inferrable-types": 0,
    "@typescript-eslint/no-unused-vars": 0,
    "react/no-find-dom-node": 0,
    "react/require-default-props": 0,
    "no-confusing-arrow": 0,
    "import/no-named-as-default-member": 0,
    "jsx-a11y/label-has-for": 0,
    "jsx-a11y/label-has-associated-control": 0,
    "import/no-named-as-default": 0,
    "import/no-extraneous-dependencies": 0,
    "no-underscore-dangle": 0,
  },
};
