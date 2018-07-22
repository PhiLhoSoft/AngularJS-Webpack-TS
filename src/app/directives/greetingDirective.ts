import { angular } from 'angular';

interface GreetingScope extends angular.IScope
{
	name: string;
}

export class GreetingDirective implements angular.IDirective
{
	public restrict = 'E';
	public template = '<div>Hello, {{name}}</div>';
	public scope = { name: '=' };

	private $timeout: angular.ITimeoutService; // Not used, it is just here to show how stuff is injected in directives

	constructor($timeout: angular.ITimeoutService)
	{
		this.$timeout = $timeout;
	}

	public static Factory(): angular.IDirectiveFactory
	{
		var directive = ($timeout: angular.ITimeoutService) =>
		{
			return new GreetingDirective($timeout);
		};

		directive.$inject = [ '$timeout' ];

		return directive;
	}

	// Simple directive without controller
	public link(scope: GreetingScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes)
	{
		scope.name = scope.name || 'World';
	}
}

// Reusable directive is isolated in its own module...
export const greetingModule = angular.module('directives.greeting', [ /* Inject here external libraries if any is used */ ])
	.directive('greeting', GreetingDirective.Factory())
	.name;
