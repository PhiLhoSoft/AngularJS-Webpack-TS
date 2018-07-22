import * as angular from 'angular';
import 'angular-mocks';
import 'jasmine-core';

import { homeModule } from './';

import { HomeController } from './homeController';

describe('Controller: Home', () =>
{
	let ctrl: HomeController;

	beforeEach(() =>
	{
		angular.mock.module(homeModule);

		angular.mock.inject(function ($controller: ng.IControllerService)
		{
			ctrl = $controller('HomeController', {});
		});
	});

	it('should have name initialized to "World"', () =>
	{
		expect(ctrl.name).toBe('World');
	});

	it('should change name', () =>
	{
		ctrl.changeName();

		expect(ctrl.name).toBe('Webpack AngularJS Demo');
	});

	it('should provide a random name', () =>
	{
		ctrl.randomizeName();

		expect(ctrl.name).not.toBe('World');
	});
});
