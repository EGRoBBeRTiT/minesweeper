const { merge } = require('webpack-merge');

const common = require('./webpack.config.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
        compress: true,
    },
    module: {
        rules: [
            ...common.module.rules,
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                auto: true,
                                localIdentName:
                                    '[name]__[local]__[hash:base64:5]',
                            },
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [['postcss-preset-env', {}]],
                            },
                        },
                    },
                    'sass-loader',
                ],
            },
        ],
    },
    plugins: [...common.plugins],
});
