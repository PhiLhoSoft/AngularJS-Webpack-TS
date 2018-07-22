/* eslint-env node */

'use strict';

// Modules
var nodePath = require('path'); // Some settings want relative paths, others want absolute ones, given via resolve()
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');

// Plugins
// var CleanWebpackPlugin = require('clean-webpack-plugin'); // Internal solution, or just use rimraf in the npm script
var HtmlWebpackPlugin = require('html-webpack-plugin');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

// Paths
var srcPath = './src/';
var prodPath = './public/';
var srcScriptPath = srcPath + 'app/';
var srcAssetsPath = srcPath + 'assets/';

/**
 * Env
 * Get NPM lifecycle event to identify the environment.
 * That's the name of the ran NPM script:
 * npm test        -> run tests once, with coverage
 * npm start       -> build for dev / debug, run server: ENV === 'server'
 * npm run test-watch   -> run tests and watch for changes, with coverage
 * npm run test-debug   -> run tests in Chrome and watch for changes, without coverage: this allows to debug the tests in Chrome
 * npm run test-verbose -> run tests in with special reporters
 * npm run stats        -> generate a statistics file in Json format. Can be used by webpack-bundle-analyzer.
 * npm run build        -> build for production
 */
var isTest = false, isDebugTest = false, isDebug = false, isProd = false, stats = false;
var ENV = process.env.npm_lifecycle_event;
if (ENV === undefined) // We ran Webpack directly without going through NPM: we want a prod build.
{
	isProd = true;
}
else
{
	isTest = ENV.startsWith('test');
	// Debug test in browser: don't use coverage which instruments / messes the code.
	// Find sources in webpack://./src/app in Chrome DevTools or use Ctrl+P to find them by name.
	isDebugTest = ENV === 'test-debug';
	isDebug = ENV === 'server';
	stats = ENV === 'stats';
	isProd = ENV === 'build' || (!isTest && !isDebug && !stats); // Unknown -> default to prod
}
if (!stats)
{
	console.log('NPM Lifecycle Event:', ENV, '-- test?', isTest, '| debug?', isDebug, '| prod?', isProd);
}
// Collect all dependencies declared in package.json
var dependencies = require('./package.json').dependencies;

/**
 * Config
 * Reference: http://webpack.github.io/docs/configuration.html
 * This is the object where all configuration gets set
 */
var config;
if (isTest)
{
	config = makeWebpackTestConfig();
}
else
{
	config = makeWebpackConfig();
}
config = addCommonPlugins(addCommonLoaders(addResolve(config)));

function makeWebpackConfig()
{
	var config = {};

	/**
	 * Entry
	 * Reference: http://webpack.github.io/docs/configuration.html#entry
	 * Should be an empty object if it's generating a test build
	 * Karma will set this when it's a test build
	 */
	config.entry =
	{
		app: srcScriptPath + 'app.ts',
		// Defines the modules that go to the 'vendor' bundle.
		vendor: Object.keys(dependencies),
	};

	/**
	 * Output
	 * Reference: http://webpack.github.io/docs/configuration.html#output
	 * Should be an empty object if it's generating a test build.
	 * Karma will handle setting it up for you when it's a test build.
	 */
	config.output =
	{
		// Absolute output directory
		path: nodePath.resolve('public/'),

		// Output path from the view of the page
		// Uses webpack-dev-server in development
		publicPath: isProd ? '/' : 'http://localhost:8080/',

		// Filename for entry points
		// Only adds hash in build mode. Use chunkhash instead of hash, so that vendor chunk remains stable across builds
		// (long term caching, see https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95 for detailed explanations)
		filename: isProd ? '[name].[chunkhash].js' : '[name].bundle.js',

		// Filename for non-entry points
		// Only adds hash in build mode
		chunkFilename: isProd ? '[name].[chunkhash].js' : '[name].bundle.js'
	};

	if (isProd)
	{
		config.mode = 'production';
	}
	else
	{
		config.mode = 'development';
	}

	/**
	 * Don't parse large libraries putting stuff at the global level.
	 * http://stackoverflow.com/questions/28969861/managing-jquery-plugin-dependency-in-webpack
	 */
	// config.noParse =
	// [
	// 	/[\/\\]node_modules[\/\\]angular[\/\\]angular\.js$/
	// ];

	/**
	 * Devtool
	 * Reference: http://webpack.github.io/docs/configuration.html#devtool
	 * Type of sourcemap to use per build type.
	 */
	if (isDebug) // server mode (dev / debug)
	{
		// config.devtool = 'eval-source-map'; // Perhaps faster to generate, but doesn't work on startup (eg. breakpoints in app.js)
		// config.devtool = 'source-map'; // So switch to this one if you have to step in app.js
		config.devtool = 'cheap-module-eval-source-map';
	}
	else if (isProd)
	{
		config.devtool = 'source-map';
	}

	/**
	 * Loaders
	 * Reference: http://webpack.github.io/docs/configuration.html#module-loaders
	 * List: http://webpack.github.io/docs/list-of-loaders.html
	 * This handles most of the magic responsible for converting modules.
	 */

	var styleLoader =
	{
		loader: isProd ? MiniCssExtractPlugin.loader : 'style-loader',
		options: { sourceMap: true },
	};

	/**
	 * PostCSS
	 * Reference: https://github.com/postcss/autoprefixer-core
	 * Add vendor prefixes to your CSS.
	 */
	var postcssLoader =
	{
		loader: 'postcss-loader',
		options:
		{
			sourceMap: true,
			config: { ctx: { autoprefixer: { browsers: [ 'last 2 versions' ] } } }
		}
	};

	// Initialize module
	config.module =
	{
		rules:
		[
			{
				// TYPESCRIPT LOADER
				// Reference: https://webpack.js.org/guides/typescript/
				// Allow processing TypeScript files.
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				// STYLUS LOADER
				// Reference: https://github.com/shama/stylus-loader
				// Allow processing Stylus files.
				//
				// Reference: https://github.com/postcss/postcss-loader
				// Postprocess your CSS with PostCSS plugins. Here, using Autoprefixer to add vendor prefixes depending on browser versions.
				//
				// Reference: https://github.com/webpack/css-loader
				// Allow loading CSS through JS (with require('foo.css')).
				//
				// Reference: https://github.com/webpack-contrib/mini-css-extract-plugin
				// Then extract CSS files (out of JS) in production builds
				//
				// Reference: https://github.com/webpack/style-loader
				// Adds CSS to the DOM by injecting a <style> tag. Used in development.
				test: /\.styl$/,
				// Extract CSS to a separate file (loads in parallel with JS, so faster)
				use:
				[
					styleLoader,
					{ loader: 'css-loader', options: { sourceMap: true } },
					postcssLoader,
					{ loader: 'stylus-loader', options: { sourceMap: true } },
				],
				exclude: /node_modules/,
			},
			{
				// CSS LOADER
				// For CSS files from modules.
				test: /\.css$/,
				// Use the 'style' loader after treatment by the CSS loader (minification with source map)
				use:
				[
					styleLoader,
					{ loader: 'css-loader', options: { sourceMap: true } },
					postcssLoader,
				],
			},
		],
	};

	// ASSET LOADER
	// Reference: https://github.com/webpack/file-loader
	// Copy asset files (images, fonts...) to output.
	// Pass along the updated reference to your code.
	// You can add here any file extension you want to get copied to your output.
	if (isProd)
	{
		config.module.rules.push(
			{
				// Manage the font files specifically (warning: SVG can be used for something else than fonts!)
				test: /\.(svg|woff|woff2|ttf|eot)$/,
				loader: 'file',
				query:
				{
					name: './fonts/[name].[ext]',
					publicPath: './'  // A bit clumsy as it generates ./../fonts/xxx but it works. Empty string is seen as false :-(
				}
			},
			{
				// Handle remaining files. It comes after the others, so it catches the remainder.
//~ 				test: /[\\\/]images[\\\/][^\\\/]+\.(png|jpg|jpeg|gif)$/, // More specific, doesn't seem necessary
				test: /\.(png|jpg|jpeg|gif)$/,
				loader: 'file',
				query:
				{
					emitFile: false,
					name: '[name].[ext]',
					publicPath: prodPath + 'assets/img/',
				}
			}
		);
	}
	else
	{
		// Just copy the files as is
		config.module.rules.push(
			{
				test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
				loader: 'file',
			}
		);
	}

	// Linters and hinters
	config.module.rules.push(
		{
			enforce: 'pre',
			test: /\.html$/,
			include: nodePath.resolve(srcPath + 'app/'),
			loader: 'htmlhint'
		},
		{
			enforce: 'pre',
			test: /\.styl$/,
			include: nodePath.resolve(srcPath + 'app/styles'),
			loader: 'stylint'
		},
		{
			enforce: 'pre',
			test: /\.js$/,
			include: nodePath.resolve(srcScriptPath),
			loader: 'eslint-loader'
		}
	);
	// config.stylint =
	// {
	// 	config: nodePath.resolve(srcPath + '.stylintrc')
	// };

	config.plugins =
	[
		// Reference: https://github.com/ampedandwired/html-webpack-plugin
		// Render index.html, adding paths to generated style and JS files at appropriate places.
		new HtmlWebpackPlugin(
		{
			// Instrument the existing index
			template: srcPath + 'index.html',
			// Produces it there
			filename: 'index.html',
			// Put JS tags at the end of the body (not in the header)
			inject: 'body'
		}),

		// Reference: https://github.com/webpack-contrib/mini-css-extract-plugin
		// Extract CSS to one file (otherwise it is inlined in the JS).
		// Disabled when not in build mode.
		new MiniCssExtractPlugin(
		{
			filename: isProd ? '[name].[chunkhash].css' : '[name].css',
		}),
	];

	// Add build specific plugins
	if (isProd)
	{
		// Reference: https://webpack.js.org/plugins/split-chunks-plugin/
		// Separates the libraries from the application.
		config.optimization =
		{
			minimize: true,
			splitChunks:
			{
				cacheGroups:
				{
					vendors:
					{
						name: 'vendor',
						test: /[\\/]node_modules[\\/]/,
						chunks: 'all',
					},
					styles:
					{
						name: 'styles',
						test: /\.css$/,
						chunks: 'all',
						enforce: true,
					}
				}
			}
		};

		config.plugins.push(
			// Reference: https://webpack.js.org/plugins/no-emit-on-errors-plugin/
			// Only emit files when there are no errors.
			new webpack.NoEmitOnErrorsPlugin(),

			// Reference: https://github.com/johnagan/clean-webpack-plugin
			// Clean the destination directories / files: since names are generated with hashes, they won't be overwritten.
			// new CleanWebpackPlugin(
			// 	[ prodPath, ]
			// ),

			// Reference: https://github.com/kevlened/copy-webpack-plugin
			// Copy assets to the destination relative to build directory (declared in 'output' configuration).
			// Do that instead of using the file-loader because some images are loaded in templates with a computed name
			// (eg. flags based on country id, etc.) which must be preserved.
			new CopyWebpackPlugin(
			[
				{
					from: srcAssetsPath + 'img',
					to: 'assets/img/'
				},
				{
					from: srcAssetsPath + 'img/favicon.ico',
					to: './'
				},
			]),
		);
	}

	/**
	 * Dev server configuration
	 * Reference: http://webpack.github.io/docs/configuration.html#devserver
	 * Reference: http://webpack.github.io/docs/webpack-dev-server.html
	 */
	config.devServer =
	{
		contentBase: './src',
		stats: 'minimal'
	};

	return config;
}

function makeWebpackTestConfig()
{
	// Configuration is much simpler in test (no CSS, etc.)
	return {
		mode: 'development',

		devtool: 'inline-source-map',

		module:
		{
			rules:
			[
				{
					enforce: 'pre',
					test: /\.ts$/,
					loader: 'tslint-loader',
					exclude: /node_modules/,
				},
				{
					// STYLUS LOADER
					test: /\.styl$/,
					loader: 'null'
				},
				{
					// CSS LOADER
					// For CSS files from modules.
					test: /\.css$/,
					loader: 'null'
				},
			]
		},

		plugins: [],
	};
	if (!isDebugTest)
	{
		// ISTANBUL LOADER
		// Reference: https://github.com/deepsweet/istanbul-instrumenter-loader
		// Instrument JS files with Istanbul for subsequent code coverage reporting.
		// Skips node_modules and files that end with .test.js.
		config.module.rules.push(
			{
				enforce: 'pre',
				test: /\.js$/,
				include: nodePath.resolve(srcScriptPath),
				exclude: /\.test\.js$/,
				loader: 'istanbul-instrumenter'
			}
		);
	}
}

function addResolve(config)
{
	/**
	 * Resolve
	 * Reference: http://webpack.github.io/docs/configuration.html#resolve
	 * Alias some paths, to avoid using require('../../foo') depending on depth in hierarchy...
	 */
	config.resolve =
	{
		// alias:
		// {
		// 	'@root': nodePath.resolve(srcScriptPath),
		// 	'@app': nodePath.resolve(srcScriptPath, 'features'),
		// 	'@home': nodePath.resolve(srcScriptPath, 'features/home'),
		// 	'@settings': nodePath.resolve(srcScriptPath, 'features/settings'),
		// 	'@model': nodePath.resolve(srcScriptPath, 'model'),
		// 	'@directives': nodePath.resolve(srcScriptPath, 'directives'),
		// 	'@services': nodePath.resolve(srcScriptPath, 'services'),
		// },
		// Replaced with the following to generate the aliases from tsconfig (one source of truth is better...)
		plugins: [ new TsconfigPathsPlugin() ],
		extensions: [ '.ts', '.js', '.json', '.html', '.styl' ],
	};

	return config;
}

function addCommonLoaders(config)
{
	config.module.rules.push(
		{
			// Load jQuery and expose it as global variable before loading AngularJS,
			// so that the latter will use it instead of jqLite.
			// Reference: https://github.com/webpack/expose-loader
			// and http://stackoverflow.com/questions/36065931/webpack-how-to-make-angular-auto-detect-jquery-and-use-it-as-angular-element-in
			test: require.resolve('jquery'), // Full path in node_modules
			loader: 'expose-loader?$!expose-loader?jQuery'
		},
		{
			// HTML LOADER
			// Reference: https://github.com/webpack/raw-loader
			// Allow loading HTML through JS.
			test: /\.html$/,
			loader: 'raw-loader'
		}
	);

	return config;
}

function addCommonPlugins(config)
{
	/**
	 * Plugins
	 * Reference: http://webpack.github.io/docs/configuration.html#plugins
	 * List: http://webpack.github.io/docs/list-of-plugins.html
	 */
	config.plugins.push(
		// Reference: http://webpack.github.io/docs/list-of-plugins.html#ignoreplugin
		// Ignore some modules. Here, avoids loading all locales of Moment.js (rather big! reduces vendor file of 165 KB).
		// We can then require specific ones. See also http://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack
//		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

		// Reference: http://webpack.github.io/docs/list-of-plugins.html#provideplugin
		// Automatically requires declared libraries creating global variables.
		new webpack.ProvidePlugin(
		{
			$: 'jquery',
			jQuery: 'jquery',
			_: 'lodash',
//			moment: 'moment',
//			angular: 'angular', // No, we have to require it everywhere anyway
		})
	);

	return config;
}


module.exports = config;
