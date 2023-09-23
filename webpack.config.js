const path = require("path");

module.exports = {
  entry: "./src/components/WidgetRender/index.tsx", // Make sure the path is correct
  output: {
    filename: "widget-render.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/, // Test for TypeScript files
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true, // Set to true if you use TypeScript types only as a development tool.
            },
          },
        ],
      },
      // Add other loaders as needed (e.g., for CSS, images)
    ],
  },
};
