const HtmlWebpackPlugin = require("html-webpack-plugin");
const PostHtmlIncludePlugin = require("posthtml-include");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");

module.exports = function (env, argv) {
  const isProd = argv.mode === "production";
  const isDev = !isProd;

  return {
    mode: "development",
    context: path.resolve(__dirname, "src"),
    entry: { main: "./index.js" },
    output: {
      filename: "[name].[contenthash:8].js",
      path: path.resolve(__dirname, "dist"),
    },

    module: {
      rules: [
        {
          test: /\.html$/i,
          use: [
            "html-loader",
            {
              loader: "posthtml-loader",
              options: {
                plugins: [
                  PostHtmlIncludePlugin({
                    root: path.resolve(__dirname, "src"),
                  }),
                ],
              },
            },
          ],
        },
        {
          test: /\.(hbs|handlebars)$/i,
          use: ["handlebars-loader"],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.m?js$/i,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.(jpg|png|svg|mp3)$/i,
          type: "asset/resource",
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: "./index.html",
        minify: isProd,
      }),
      new MiniCssExtractPlugin({
        filename: "[name].[contenthash:8].css",
      }),
      new ESLintPlugin(),
      new CleanWebpackPlugin(),
    ],

    devtool: isDev ? "source-map" : undefined,
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
        watch: true,
      },
      compress: true,
      port: 5500,
      hot: isDev,
    },
  };
};
