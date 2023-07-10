/** @type {import("eslint").Linter.Config} */
const config = {
  extends: ["next/core-web-vitals"],
  rules: {
    "react/display-name": "off",
  },
};

module.exports = config;
