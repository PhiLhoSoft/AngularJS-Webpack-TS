import { classDecoratorTwo } from 'decorators/ts-decorators';
import { AddNameController } from './addNameController';

export interface AddNameScope extends ng.IScope
{
	list: Array<string>;
}

@classDecoratorTwo('AddNameDirective', 'Directive showing names and allowing to add one')
export class AddNameDirective implements ng.IDirective
{
	public restrict = 'E';
	public template = require('./addName.html'); // tslint:disable-line no-require-imports
	public scope = { list: '=' };
	public controller = 'AddNameController';
	public controllerAs = 'an';

	public static factory(): ng.IDirectiveFactory
	{
		const directive = () =>
		{
			return new AddNameDirective();
		};

		return directive;
	}

	public constructor()
	{
		console.log('AddNameDirective.constructor'); // tslint:disable-line no-console
	}

	public link(scope: AddNameScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: AddNameController)
	{
		scope.$watch('list', (names: Array<string>) =>
		{
			ctrl.update(names);
		});
	}
}
