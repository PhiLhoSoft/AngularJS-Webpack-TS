import * as angular from 'angular';

interface GreetingScope extends ng.IScope
{
	name: string;
}

export class GreetingDirective implements ng.IDirective
{
	public restrict = 'E';
	public template = '<div>Hello, {{name}}</div>';
	public scope = { name: '=' };

	private $timeout: ng.ITimeoutService; // Here mostly to show how stuff is injected in directives

	public static factory(): ng.IDirectiveFactory
	{
		const directive = ($timeout: ng.ITimeoutService) =>
		{
			return new GreetingDirective($timeout);
		};

		directive.$inject = [ '$timeout' ];

		return directive;
	}

	constructor($timeout: ng.ITimeoutService)
	{
		this.$timeout = $timeout;
	}

	// Simple directive without controller
	public link(scope: GreetingScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes)
	{
		scope.name = scope.name || 'World';
		this.$timeout(() =>
		{
			scope.name = 'timeout';
		}, 10000);
	}
}

// Reusable directive is isolated in its own module...
export const greetingModule = angular.module('directives.greeting', [ /* Inject here external libraries if any is used */ ])
	.directive('greeting', GreetingDirective.factory())
	.name;
