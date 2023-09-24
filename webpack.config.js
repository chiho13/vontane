const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/components/EmbedWidget/index.tsx",
  //   entry: "./src/components/Test/index.tsx",
  output: {
    // filename: "embedwidget.js",
    filename: "widget.js",
    path: path.resolve(__dirname, "dist"),
    library: {
      //   name: "EmbedWidget",
      name: "Embed",
      type: "var",
    },
  },
  resolve: {
    fallback: {
      path: require.resolve("path-browserify"),
      zlib: require.resolve("browserify-zlib"),
      fs: false,
      util: false,
      assert: false,
    },
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
      {
        test: /\.css$/, // Test for CSS files
        use: [
          "style-loader", // Inject styles into DOM
          "css-loader", // Translates CSS into CommonJS modules
        ],
      },
      // Add other loaders as needed (e.g., for images)
    ],
  },
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
};
