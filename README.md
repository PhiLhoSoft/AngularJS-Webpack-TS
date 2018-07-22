# angularjs-webpack-ts

## Notes

This is a fork of my https://github.com/PhiLhoSoft/Angular-Webpack-Playground project which is itself a fork of the projects https://github.com/preboot/angular-webpack for the updated Webpack configuration, and of https://github.com/angular-tips/webpack-demo for the non-trivial AngularJS example.
I used TypeScript in this one, as I recently worked on several AngularJS 1.x projects using TypeScript.

Note that this "project" has no real purpose, no business logic, its aim is just to have services, controllers, directives, etc. and to see how to use them in a Webpack project.
Beside, I also experimented with various TypeScript features, like decorators (needed to use them, as well), and a section explores the various AngularJS bindings.

I admit that in this project, I severaly neglected tests... They will remain a TODO item for now.

I added some linters for HTML, CSS and TS.
I added a Stylus compilation phase (should be trivial to adapt to Sass / Less or other similar).
I added some modules / features (other router states), and some in-module controllers / etc. to better explore AngularJS usage.

You can compile for debug with `npm run build:debug`, or for production with `npm run build:prod`.
The Webpack server is broken, I have to see why. Anyway, I have made a simple server.js file, running with Express, to serve the build for testing. Launch it with `npm run server:app`.
In the api folder, I have set up a simplistic API delivering random user information via the handy *faker* library. Launch it with `npm run server:api`. If it doesn't run, you will get an error in the console.
`npm start` lauches app server.

In dev mode, I switched from `eval-source-map` to plain `source-map` (probably slower) because breakpoints in startup (app.js) were not found by Chrome.

## License

[zlib/libpng license](/LICENSE)
