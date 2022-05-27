import path from "path";
// import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
require("babel-polyfill");

export default {
	entry: ["babel-polyfill", "./src/Client/index.ts"],
	devtool: "source-map",
	target: process.env.NODE_ENV === "production" ? "browserslist" : "web",
	mode: process.env.NODE_ENV === "production" ? "production" : ("development" as "production" | "development" | "none" | undefined),
	devServer: {
		stats: { colors: true },
	},
	module: {
		rules: [
			{ test: /\.js$/, exclude: /node_modules/, use: { loader: "babel-loader", options: { presets: ["@babel/preset-env"] } } },
			{ test: /\.s?css$/, exclude: /node_modules/, use: ["style-loader", "css-loader", "postcss-loader", { loader: "sass-loader", options: { sourceMap: false } }] }, // sourceMap: false prevent style crashing when live-updating
			{
				test: /\.(ico|jpg|png)$/,
				exclude: /node_modules/,
				loader: "file-loader",
				options: { esModule: false, name: (rpath: string) => path.relative(path.resolve(__dirname, "src/Client"), rpath) },
			},
		],
	},

	plugins: [
		// new MiniCssExtractPlugin({ filename: 'style/[name].css'}),
		new HtmlWebpackPlugin({ template: "./src/Client/index.html" }),
	],

	output: {
		clean: true,
		filename: "./[name].js",
	},
};
