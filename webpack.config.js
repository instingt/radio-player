const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    mode: isDevelopment ? 'development' : 'production',
    entry: './src/index.ts', // Точка входа для TypeScript
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    output: {
      filename: 'bundle.js', // Создаем бандл
      path: path.resolve(__dirname, 'dist'),
      clean: true, // Очищает папку dist перед каждой сборкой
    },
    optimization: {
      minimize: !isDevelopment,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false, // Убираем все комментарии
            },
          },
          extractComments: false, // Не выносим комментарии в отдельные файлы
        }),
      ],
    },
    devtool: isDevelopment ? 'inline-source-map' : false, // Source maps для разработки
    devServer: {
      static: './dist', // Откуда раздавать файлы
      watchFiles: ['src/**/*'], // Следим за изменениями в исходных файлах
      hot: true, // Включаем HMR
      open: true, // Автоматически открываем браузер
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: isDevelopment, // В режиме разработки подключаем бандл как внешний файл
        template: './src/index.html', // Используем HTML шаблон
        scriptLoading: 'blocking', // Устанавливаем способ загрузки скриптов
      }),
      !isDevelopment && {
        apply: (compiler) => {
          compiler.hooks.emit.tapAsync('InlineBundlePlugin', (compilation, callback) => {
            const bundleContent = compilation.assets['bundle.js'].source();
            const htmlContent = fs.readFileSync('./src/index.html', 'utf-8');
            const finalHtml = htmlContent.replace('<script></script>', `<script>${bundleContent}</script>`);

            // Записываем итоговый файл в папку dist
            compilation.assets['index.html'] = {
              source: () => finalHtml,
              size: () => finalHtml.length,
            };

            callback();
          });
        },
      },
    ].filter(Boolean),
  };
};
