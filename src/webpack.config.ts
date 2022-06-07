import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";

export default {
	entry: {
		"graphql-client" : "./src/Client/graphql-client.ts",
		"index" : "./src/Client/index.ts"
	},
	devtool: "source-map",
	target: process.env.NODE_ENV === "production" ? "browserslist" : "web",
	mode: process.env.NODE_ENV === "production" ? "production" : ("development" as "production" | "development" | "none" | undefined),
	devServer: {
		stats: { colors: true },
	},
	resolve: {
        extensions: ['.ts', '.js', '.json']
    },
	module: {
		rules: [
			{ test: /\.ts$/, exclude: /node_modules/, use: [ "babel-loader", 'ts-loader'] },
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
		new HtmlWebpackPlugin({ filename: 'graphql-client.html', template: "./src/Client/graphql-client.html", chunks: ['graphql-client'] }),
		new HtmlWebpackPlugin({ filename: 'index.html', template: "./src/Client/index.html", chunks: ['index'] }),
	],

	output: {
		clean: true,
		filename: "./[name].js",
		path: path.resolve(__dirname, '../build/Client'),
	},
};

