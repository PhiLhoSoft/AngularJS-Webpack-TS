import { NameModel } from '@model/nameModel';

export class SettingsController
{
	public static $inject = [ '$scope', 'nameModel' ];

	public names: Array<string>;

	constructor($scope: ng.IScope, nameModel: NameModel)
	{
		this.names = nameModel.names;

		$scope.$on('addName', function __addName(event: any, name: string)
		{
			nameModel.addName(name);
		});
	}
}
