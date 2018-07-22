import { NameModel } from '@model/nameModel';
import { Events } from '@model/events';

export class SettingsController
{
	public static $inject = [ '$rootScope', '$scope', 'nameModel' ];

	public names: Array<string>;

	public constructor($rootScope: ng.IRootScopeService, $scope: ng.IScope, nameModel: NameModel)
	{
		this.names = nameModel.names;

		const listener = $rootScope.$on(Events.namesUpdate, (event: any, names: Array<string>) =>
		{
			this.names = names;
		});

		$scope.$on(Events.addName, (event: any, name: string) =>
		{
			nameModel.addName(name);
		});

		$scope.$on('$destroy', listener);
	}
}
