import { AddNameScope } from './addNameDirective';

export class AddNameController
{
	public static $inject = [ '$scope' ];

	public $scope: AddNameScope;

	public list: Array<string>;
	public name: string;
	public isDisabled: boolean;
	public addNameTooltip: string;

	controller($scope: AddNameScope)
	{
		this.$scope = $scope;

		this.list = $scope.list; // From directive

		this.check();
	}

	public check()
	{
		this.isDisabled = true;
		if (!this.list || this.list.length === 0)
		{
			this.addNameTooltip = 'No names provided';
			return;
		}
		if (!this.name || this.name.length === 0)
		{
			this.addNameTooltip = 'Need a name';
			return;
		}
		if (this.list.some(name => this.name === name))
		{
			this.addNameTooltip = 'Duplicate name';
			return;
		}

		this.addNameTooltip = 'Add a new name';
		this.isDisabled = false;
	}

	public add()
	{
		this.$scope.$emit('addName', this.name);
	}
}
