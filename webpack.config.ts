import path from "path";
import webpack from "webpack";
import ESLintPlugin from "eslint-webpack-plugin";

const config: webpack.Configuration = {
	watch: true,
	mode: "production",
	entry: "./src/main.ts",
	plugins: [
		new ESLintPlugin({
			context: "../",
			failOnError: false,
			extensions: ["ts"],
			configType: "flat",
			eslintPath: "eslint/use-at-your-own-risk",
		}),
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: "asset/resource",
			},
			{
				test: /\.wgsl/,
				loader: "webpack-wgsl-loader",
			},
		],
	},
	resolve: {
		extensions: [".tsx", ".ts"],
	},
	output: {
		path: path.resolve(__dirname, "public"),
		filename: "main.js",
	},
};

export default config;
