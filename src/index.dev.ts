import app from './app';

//----------------------------------------------
import webpack from 'webpack';
import webpackConfig from './webpack.config';
import webpackDevMidlewareFactory from 'webpack-dev-middleware';
const compiler = webpack(webpackConfig);
const webpackDevMidleware = webpackDevMidlewareFactory(compiler, webpackConfig.devServer);
app.use(webpackDevMidleware);
//----------------------------------------------