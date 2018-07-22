import { angular } from 'angular';
import { NameModel } from '../../model/nameModel';

export class SettingsController
{
	static $inject = [ '$scope', 'nameModel' ];

	public names: Array<string>;

	constructor($scope: angular.IScope, nameModel: NameModel)
	{
		this.names = nameModel.names;

		$scope.$on('addName', function __addName(event: any, name: string)
		{
			nameModel.add(name);
		});
	}
}
