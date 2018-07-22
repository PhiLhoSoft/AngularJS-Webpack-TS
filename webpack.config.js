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
var publicPath = './public/';
var srcPath = './src/';
var srcAppPath = srcPath + 'app/';
var srcAssetsPath = srcPath + 'assets/';
var resolvedSrcAppPath = nodePath.resolve(srcAppPath);

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
 * npm run build:debug  -> build for debug - stuff goes to public, not minimized
 * npm run build:prod   -> build for production
 */
var isTest = false, isBuild = false, isDebugTest = false, isDebug = false, isProd = false, stats = false;
var ENV = process.env.npm_lifecycle_event;
if (ENV === undefined) // We ran Webpack directly without going through NPM: we want a prod build.
{
	isProd = true;
}
else
{
	isTest = ENV.startsWith('test');
	isBuild = ENV.startsWith('build');
	// Debug test in browser: don't use coverage which instruments / messes the code.
	// Find sources in webpack://./src/app in Chrome DevTools or use Ctrl+P to find them by name.
	isDebugTest = ENV === 'test-debug';
	isDebug = ENV === 'server:webpack' || ENV === 'build:debug';
	stats = ENV === 'stats';
	isProd = ENV === 'build:prod';
}
if (!stats)
{
	console.log('NPM Lifecycle Event:', ENV, '-- test?', isTest, '| build?', isBuild, '| debug?', isDebug, '| debugTest?', isDebugTest, '| prod?', isProd);
}
// Collect all dependencies declared in package.json
var dependencies = require('./package.json').dependencies;

/**
 * Config
 * Reference: https://webpack.js.org/configuration/
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
// Add stuff common to tests and non-test runs
config = addCommonLoaders(addResolve(config));

if (!isProd)
{
	// Keep warning about chunk sizes to production mode only, it is irrelevant in dev
	config.performance = { hints: false };
}

function makeWebpackConfig()
{
	var config = {};

	/**
	 * Entry
	 * Reference: https://webpack.js.org/configuration/entry-context#entry
	 * Should be an empty object if it's generating a test build
	 * Karma will set this when it's a test build
	 */
	config.entry =
	{
		app: srcAppPath + 'app.ts',
		// Defines the modules that go to the 'vendor' bundle.
		vendor: Object.keys(dependencies),
	};

	/**
	 * Output
	 * Reference: https://webpack.js.org/configuration/output
	 * Should be an empty object if it's generating a test build.
	 * Karma will handle setting it up for you when it's a test build.
	 */
	config.output =
	{
		// Absolute output directory
		path: nodePath.resolve(publicPath),

		// Output path from the view of the page
		// Uses webpack-dev-server in development
		publicPath: '/',

		// Filename for entry points
		// Only adds hash in production mode. Use chunkhash instead of hash, so that vendor chunk remains stable across builds
		// (long term caching, see https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95 for detailed explanations)
		filename: isProd ? '[name].[chunkhash].js' : '[name].bundle.js',

		// Filename for non-entry points
		// Only adds hash in production mode
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
	 * Devtool
	 * Reference: https://webpack.js.org/configuration/devtool
	 * Type of sourcemap to use per build type.
	 */
	if (isDebug) // server mode (dev / debug)
	{
		// config.devtool = 'eval-source-map'; // Perhaps faster to generate, but doesn't work on startup (eg. breakpoints in app.js)
		config.devtool = 'source-map'; // So switch to this one if you have to step in app.js
		// config.devtool = 'inline-source-map';
		// config.devtool = 'cheap-module-eval-source-map';
	}
	else if (isProd)
	{
		config.devtool = 'source-map';
	}

	/**
	 * Module loaders
	 * Concept: https://webpack.js.org/concepts/modules/
	 * Reference: https://webpack.js.org/configuration/module
	 * List: https://webpack.js.org/loaders
	 * This handles most of the magic responsible for converting modules.
	 */

	function makeCssLoader(loader) { return { loader: loader, options: { sourceMap: true } }; }

	// var styleLoader = makeCssLoader(isProd ? MiniCssExtractPlugin.loader : 'style-loader');
	var styleLoader = makeCssLoader(MiniCssExtractPlugin.loader);

	/**
	 * PostCSS (see below)
	 */
	var postcssLoader =
	{
		loader: 'postcss-loader',
		options:
		{
			ident: 'postcsss',
			sourceMap: true,
			plugins: (loader) => [ require('autoprefixer')() ],
			config: { ctx: { autoprefixer: { browsers: [ 'last 2 versions' ] } } }
		}
	};

	// Initialize module
	config.module =
	{
		rules:
		[
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
				// OR
				// Reference: https://github.com/webpack/style-loader
				// Adds CSS to the DOM by injecting a <style> tag. Used in development.
				test: /\.styl$/,
				// Extract CSS to a separate file (loads in parallel with JS, so faster)
				use:
				[
					styleLoader,
					makeCssLoader('css-loader'),
					postcssLoader,
					makeCssLoader('stylus-loader'),
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
					makeCssLoader('css-loader'),
					postcssLoader,
				],
			},
		],
	};

	config.plugins =
	[
		// Reference: https://github.com/ampedandwired/html-webpack-plugin
		// Render index.html, adding paths to generated style and JS files at appropriate places.
		new HtmlWebpackPlugin(
		{
			// Instrument the existing index
			template: srcPath + 'index.html',
			// Produces it there
			filename: nodePath.resolve(publicPath + 'index.html'),
			// Put JS tags at the end of the body (not in the header)
			inject: 'body',
			chunksSortMode: 'manual',
			chunks: [ 'vendor', 'app' ],
		}),

		// Reference: https://github.com/webpack-contrib/mini-css-extract-plugin
		// Extract CSS to one file (otherwise it is inlined in the JS).
		new MiniCssExtractPlugin(
		{
			filename: isProd ? '[name].[chunkhash].css' : '[name].bundle.css',
		}),
	];

	if (isBuild)
	{
		// Reference: https://webpack.js.org/plugins/split-chunks-plugin/
		// Separates the libraries from the application.
		config.optimization =
		{
			// minimize: isProd, // Now done by mode option
			splitChunks:
			{
				chunks: 'all',
				minSize: 1000,
				cacheGroups:
				{
					vendors:
					{
						name: 'vendor',
						test: /[\\/]node_modules[\\/]/,
						chunks: 'initial',
						enforce: true,
					},
				}
			}
		};

		// Add build specific plugins
		config.plugins.push(
			// Reference: https://webpack.js.org/plugins/no-emit-on-errors-plugin/
			// Only emit files when there are no errors.
			new webpack.NoEmitOnErrorsPlugin(),

			// Reference: https://github.com/johnagan/clean-webpack-plugin
			// Clean the destination directories / files: since names are generated with hashes, they won't be overwritten.
			// Now done with rimraf in npm scripts
			// new CleanWebpackPlugin(
			// 	[ prodPath, ]
			// ),

			// Reference: https://github.com/kevlened/copy-webpack-plugin
			// Copy assets to the destination relative to build directory (declared in 'output' configuration).
			// Do that instead of using the file-loader because some images are loaded in templates with a computed name
			// (eg. flags based on country id, etc.) which must be preserved.
			// But it doesn't work with webpack-dev-server directly,
			// so we have to do a build run (prod or debug) before to generate files in public directory.
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
	 * Reference: https://webpack.js.org/configuration/dev-server/
	 * Access the app at http://localhost:8080/webpack-dev-server/ (trailing slash is important!)
	 */
	config.devServer =
	{
		// To find index.html and assets. Currently, we have to run a build before, and then there is no HMR...
		// Seems not to work with HtmlWebpackPlugin. See https://gist.github.com/ampedandwired/becbbcf91d7a353d6690
		contentBase: nodePath.resolve(publicPath),
		publicPath: '/',
		port: 8080,
		historyApiFallback: true,
		hot: true,
		inline: true,
    	// watchContentBase: true,
		stats: 'minimal',
	};

	return config;
}

function makeWebpackTestConfig()
{
	// Configuration is much simpler in test (no CSS, etc.)
	var config =
	{
		mode: 'development',

		devtool: 'inline-source-map',

		module:
		{
			rules:
			[
				{
					// STYLUS LOADER
					test: /\.styl$/,
					use: 'null-loader'
				},
				{
					// CSS LOADER
					// For CSS files from modules.
					test: /\.css$/,
					use: 'null-loader'
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
				enforce: 'post',
				test: /\.ts$/,
				include: resolvedSrcAppPath,
				exclude: /\.test\.ts$/,
				use:
				{
					use: 'istanbul-instrumenter-loader',
					query: { esModules: true }
				}
			}
		);
	}
	return config;
}

function addResolve(config)
{
	/**
	 * Resolve
	 * Reference: https://webpack.js.org/configuration/#resolve
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
		// Tells what extensions to use / try with imports without extension.
		extensions: [ '.js', '.ts', '.json' ],
	};

	return config;
}

function addCommonLoaders(config)
{
	config.module.rules.push(
		// Linters and hinters
		{
			enforce: 'pre',
			test: /\.ts$/,
			use: 'tslint-loader',
			include: resolvedSrcAppPath,
		},
		{
			enforce: 'pre',
			test: /\.html$/,
			use: 'htmlhint-loader',
			include: resolvedSrcAppPath,
		},
		// Would add a Stylus linter but the one for Webpack is obsolete
		{
			// TYPESCRIPT LOADER
			// Reference: https://webpack.js.org/guides/typescript/
			// Allow processing TypeScript files.
			test: /\.ts$/,
			use: 'ts-loader',
			include: resolvedSrcAppPath,
		},
		{
			// HTML LOADER
			// Reference: https://github.com/webpack/raw-loader
			// Allow loading HTML through JS (require() in template declarations).
			test: /\.html$/,
			use: 'raw-loader',
			include: resolvedSrcAppPath,
		},
	);
	config.plugins.push(
		// Provide the jquery library when AngularJS checks if window.jQuery is present,
		// so that the latter will use it instead of jqLite.
		// Reference: https://webpack.js.org/plugins/provide-plugin/
		// Reference: http://stackoverflow.com/questions/36065931/webpack-how-to-make-angular-auto-detect-jquery-and-use-it-as-angular-element-in
		new webpack.ProvidePlugin(
			{
				"window.jQuery": "jquery"
			}
		),
	);

	return config;
}
console.log(JSON.stringify(config));

module.exports = config;
