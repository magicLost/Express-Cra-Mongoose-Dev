const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpackNodeExternals = require('webpack-node-externals');

module.exports = {

    target: 'node',

    mode: "development",

    entry: path.join(__dirname, "src", "server", "server.ts"),

    resolve: {
        extensions: [".tsx", ".ts", ".js", ".scss", ".css", ".svg", ".png"]
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            "@babel/env",
                            //"@babel/preset-react",
                            "@babel/preset-typescript"
                        ],
                        plugins: [
                            "@babel/proposal-class-properties",
                            "@babel/proposal-object-rest-spread",
                            "@babel/plugin-syntax-dynamic-import",
                            "@babel/plugin-transform-runtime",
                        ]
                    }
                }
            }
        ]
    },

    output: {
        filename: "server.build.js",
        path: path.resolve(__dirname, "dist-server")
    },

    externals: [webpackNodeExternals()],

    node: {
        // Need this when working with express, otherwise the build fails
        __dirname: false,   // if you don't put this is, __dirname
        __filename: false,  // and __filename return blank or /
        process: false
    },

    plugins: [
        new webpack.WatchIgnorePlugin([
            "global.d.ts",
            "scss/.d.ts$/",
            "css/.d.ts$/",
            "svg/.d.ts$/"
        ]),
        new CleanWebpackPlugin()
    ]
};