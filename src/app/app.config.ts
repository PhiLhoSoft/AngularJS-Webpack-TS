import * as uirouter from '@uirouter/angularjs';

(<any>routing).$inject = [ '$urlRouterProvider', '$stateProvider', '$locationProvider' ];

export function routing($urlRouterProvider: uirouter.UrlRouterProvider, $stateProvider: uirouter.StateProvider, $locationProvider: ng.ILocationProvider): void
{
	// $log cannot be injected here (config()) as it is not available yet
	// console.log('Defining routing for app');
	$locationProvider.html5Mode(true);
	$urlRouterProvider.otherwise('/');

	// tslint:disable no-require-imports
	$stateProvider
		.state('home',
		{
			url: '/',
			template: require('@home/home.html'),
			controller: 'HomeController',
			controllerAs: 'home'
		})
		.state('settings',
		{
			url: '/settings',
			template: require('@settings/settings.html'),
			controller: 'SettingsController',
			controllerAs: 'settings'
		})
		.state('about',
		{
			url: '/about',
			template: require('./about.html'),
			controller: 'AboutController',
			controllerAs: 'about'
		});
}
