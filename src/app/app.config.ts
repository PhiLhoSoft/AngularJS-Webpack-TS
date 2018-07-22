import angular from 'angular';
import uiRouter from 'angular-ui-router';

(<any>routing).$inject = [ '$urlRouterProvider', '$locationProvider', '$stateProvider' ];

export function routing($urlRouterProvider: angular.ui.IUrlRouterProvider, $locationProvider: any, $stateProvider: angular.ui.IStateProvider): void
{
	// $log cannot be injected here (config()) as it is not available yet
	console.log('Defining routing for app');
	$locationProvider.html5Mode(true);
	$urlRouterProvider.otherwise('/');

	// TODO remove require()
	$stateProvider
		.state('home',
		{
			url: '/',
			template: require('home/home.html'),
			controller: 'HomeController',
			controllerAs: 'home'
		})
		.state('settings',
		{
			url: '/settings',
			template: require('settings/settings.html'),
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
