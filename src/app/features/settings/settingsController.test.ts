import * as angular from 'angular';
import 'angular-mocks';
import 'jasmine-core';

import { modelModule } from '@model/.';
import { settingsModule } from './';

import { SettingsController } from './settingsController';
import { NameModel } from '@model/nameModel';

interface TestScope extends ng.IScope
{
	names: Array<string>;
}

let scope: TestScope, nameModel: NameModel;

describe('Controller: Settings', () =>
{
	let ctrl: SettingsController;

	beforeEach(() =>
	{
		angular.mock.module(settingsModule, modelModule);

		angular.mock.inject(function ($injector: ng.auto.IInjectorService, $rootScope: ng.IRootScopeService, $controller: ng.IControllerService)
		{
			scope = <TestScope>$rootScope.$new();
			nameModel = $injector.get('nameModel');
			ctrl = $controller('SettingsController', { $scope: scope });
		});
	});

	it('should have the list of names', () =>
	{
		// TODO need to mock $http now
		// expect(ctrl.names).toBe(nameModel.names);
	});

	it('should update the list of names', () =>
	{
		let name = 'Hodor';
		scope.$emit('addName', name);

		expect(ctrl.names).toContain(name);
	});
});
