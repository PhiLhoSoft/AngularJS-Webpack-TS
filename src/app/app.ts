// Libraries, using the NPM name (used in package.json)
import * as angular from 'angular';
import uirouter from '@uirouter/angularjs';

import { NameModel } from './model/nameModel';

import '../style/app.styl';

// Application modules
import { modelModule } from './model/';
import { homeModule } from './features/home/';
import { settingsModule } from './features/settings/';

import { routing } from './app.config';

angular.module('demo-app', [ uirouter, modelModule, homeModule, settingsModule ])
	.config(routing)
	.run(
	[
		// Some services / factories can be injected here to bootstrap them
		'$rootScope', '$log',
		function ($rootScope: angular.IScope, $log: angular.ILogService): void
		{
			// Make available in any template...
			(<any>$rootScope).url = 'https://github.com/PhiLhoSoft/AngularJS-Webpack-TS/';
			$log.info('Starting the application.');
		}
	])
	// Small controller can be declared on the fly...
	.controller('AboutController',
	[
		'$scope', 'nameModel', // Components still has to be injected the old way...
		function AboutController($scope: angular.IScope, nameModel: NameModel): void
		{
			const ctrl = this;

			ctrl._activate = function ()
			{
				// Possibly get information from server...
				ctrl.productName = nameModel.applicationName;
				ctrl.productVersion = '0.1';
			};

			// See http://www.befundoo.com/university/tutorials/angularjs-2-controllers/ (and good idea anyway)
			ctrl._activate();
		}
	]);
