import { AddNameScope } from './addNameDirective';
import { Events } from '@model/events';
import { methodDecoratorOne, methodDecoratorTwo, classDecoratorOne, classDecoratorTwo, classDecoratorThree } from 'decorators/ts-decorators';

@classDecoratorOne
@classDecoratorTwo('AddNameController', 'Add a name and update the list of names')
@classDecoratorThree
export class AddNameController
{
	public static $inject = [ '$scope', '$timeout' ];

	public list: Array<string>;
	public name: string;
	public isDisabled: boolean;
	public addNameTooltip: string;

	private timeoutPromise: ng.IPromise<any>;

	public constructor(
		private $scope: AddNameScope,
		private $timeout: ng.ITimeoutService
	)
	{
		console.log('AddNameController.contructor'); // tslint:disable-line no-console
		this.list = $scope.list; // From directive

		this.check();
	}

	@methodDecoratorOne('AddNameController.updating', 'Doing an update')
	@methodDecoratorTwo
	public update(names: Array<string>)
	{
		this.list = names;
	}

	public check()
	{
		this.isDisabled = true;
		if (!this.list || this.list.length === 0)
		{
			this.addNameTooltip = 'No names provided';
		}
		else if (!this.name || this.name.length === 0)
		{
			this.addNameTooltip = 'Need a name';
		}
		else if (this.list.some(name => this.name === name))
		{
			this.addNameTooltip = 'Duplicate name';
		}
		else
		{
			this.addNameTooltip = 'Add a new name';
			this.isDisabled = false;
		}
		(<any>this).added();
		if (this.timeoutPromise)
		{
			this.$timeout.cancel(this.timeoutPromise);
		}
	}

	@methodDecoratorTwo
	public add()
	{
		this.$scope.$emit(Events.addName, this.name);
		this.timeoutPromise = this.$timeout(() =>
		{
			this.name = undefined;
		}, 3000);
	}
}
