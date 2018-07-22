// Libraries, using the NPM name (used in package.json)
import * as angular from 'angular';
import uirouter from '@uirouter/angularjs';

import { NameModel } from '@model/nameModel';

import '../styles/app.styl';

// Application modules
import { modelModule } from '@model/.';
import { homeModule } from '@home/.';
import { settingsModule } from '@settings/.';
import { informationModule } from '@directives/showInformationDirective';

import { routing } from './app.config';

angular.module('demo-app', [ uirouter, modelModule, homeModule, settingsModule, informationModule ])
	.config(routing)
	.run(
	[
		// Some services / factories can be injected here to bootstrap them
		'$rootScope', '$log',
		function ($rootScope: angular.IScope, $log: angular.ILogService): void
		{
			// Make available in any template...
			(<any>$rootScope).url = 'https://github.com/PhiLhoSoft/AngularJS-Webpack-TS/';
			// Trace a bit
			$log.info('----- Starting the application -----', angular.element); // Should be jQuery, not jqLite
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

				// Simple variable, string
				ctrl.userName = 'Jean-Jacques';
				ctrl.userCountry = 'Italy';
				// Simple variable, number
				ctrl.userAge = 42;
				ctrl.userWeight = 66;
				// Object
				ctrl.userInfo =
				{
					name: 'Pierre-Paul',
					country: 'Germany',
					tick: '#',
					age: 99,
					weight: 100,
				};
				// Called from template
				ctrl.changeUser = () =>
				{
					ctrl.userName = ctrl.userInfo.name = ctrl.userName.split('').reverse().join('');
					ctrl.userCountry = ctrl.userCountry.substring(0, ctrl.userCountry.length - 1);
					ctrl.userAge--;
					ctrl.userWeight--;
					ctrl.userInfo.country = ctrl.userInfo.country.substring(0, ctrl.userInfo.country.length - 1);
					ctrl.userInfo.age--;
					ctrl.userInfo.weight--;
					// Initially empty (undefined -> empty by Angular binding). Upon first init, display the value. Won't update later.
					ctrl.oneTime = ctrl.userAge;
				};
				// Given to directive, called from its template
				ctrl.update = (name: string) =>
				{
					ctrl.userName = name ? name.toUpperCase() : '(unknown)';
					ctrl.userAge++;
					ctrl.userCountry += '!';
				};
				// Given to directive, called from its code
				ctrl.changeUserInfo = (name: string, age: number) =>
				{
					ctrl.userInfo.name = name || '(nobody)';
					ctrl.userInfo.age = age;
				};
			};

			ctrl._activate();
		}
	]);
