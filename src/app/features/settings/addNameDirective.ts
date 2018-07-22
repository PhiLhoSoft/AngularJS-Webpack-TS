import { angular } from 'angular';

import { AddNameController } from "./addNameController";

interface AddNameScope extends ng.IScope
{
	list: string;
}

export class AddNameDirective implements angular.IDirective
{
	public restrict = 'E';
	public templateUrl = 'addName.html';
	public scope = { list: '=' };
	public controller: AddNameController;
	public controllerAs: 'an';

	constructor() {}

	public static Factory(): angular.IDirectiveFactory
	{
		var directive = () =>
		{
			return new AddNameDirective();
		};

		directive.$inject = [ '$timeout' ];

		return directive;
	}

	public link(scope: AddNameScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes)
	{
		// Don't do anything yet
	}
}
