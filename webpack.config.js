const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin  = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')


const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev



const optimization = () => {
    const config = {
        splitChunks: {
            chunks: "all"
        }
    }
    if(isProd){
        config.minimizer = [
           new OptimizeCssAssetsWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }

    return config
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const babelOptions = preset => {
    const opts = {
        presets: [
            '@babel/preset-env'
        ],
        plugins:[
            '@babel/plugin-proposal-class-properties'
        ]
    }

    if(preset){
        opts.presets.push(preset)
    }

    return opts
}

const jsLoaders = () => {
    const loaders = [{
        loader: 'babel-loader',
        options: babelOptions()
    }]

    if (isDev){
        loaders.push('eslint-loader')
    }

    return loaders
}

const plugins = () => {
        return [
            new HTMLWebpackPlugin({
                template: "../index.html",
                filename

                // minify: {
                //     collapseWhitespace: isProd
                // }
            }),
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin({
                filename: filename('css')
            })
        ]



}




module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        scripts: [ '@babel/polyfill' , './js/scripts.js']
    },
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'theme')
    },
    resolve:{
        extensions: ['.js', '.json', 'png'],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    devServer:{
        port: '3000',
        hot: isDev
    },
    devtool: isDev ? 'source-map' : '',
    optimization: optimization(),
    plugins: plugins(),
    module:{
        rules: [
            {
                test: /\.(css|s[ac]ss)$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        hmr: isDev,
                        reloadAll: true
                    }
                }, 'css-loader', 'sass-loader']
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader']
            },
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                use: ['file-loader']
            },
            {   test: /\.js$/,
                exclude: /node_modules/,
                use: jsLoaders()
            },
            {   test: /\.jsx$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelOptions('@babel/preset-react')
                }
            }
        ]
    }
};
