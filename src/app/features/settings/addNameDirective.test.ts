import * as angular from 'angular';
import 'angular-mocks';

import { settingsModule } from './';

import { AddNameScope } from './addNameDirective';

interface TestScope extends ng.IScope
{
	names: Array<string>;
}

let scope: TestScope, compile: ng.ICompileService;

describe('Directive: addName', () =>
{
	beforeEach(() =>
	{
		angular.mock.module(settingsModule);

		angular.mock.inject(($rootScope: ng.IRootScopeService, $compile: ng.ICompileService, $templateCache: ng.ITemplateCacheService) =>
		{
			scope = <TestScope>$rootScope.$new();
			compile = $compile;
			$templateCache.put('addName.html', '<div></div>');
		});
	});

	it('should disable if the list of names is not provided', () =>
	{
		let addName = compile('<add-name list="names"></add-name>')(scope);
		scope.$digest();

		expect(addName).not.toBeNull();

		let isolatedScope = <AddNameScope>addName.isolateScope();
		expect(isolatedScope.list).toBeUndefined();

		let ctrl = (<any>isolatedScope).an;
		expect(ctrl.isDisabled).toBe(true);
		expect(ctrl.addNameTooltip).toBe('No names provided');
	});

	it('should have the list of names', () =>
	{
		scope.names = [ 'a', 'b' ];
		let addName = compile('<add-name list="names"></add-name>')(scope);
		scope.$digest();

		expect(addName).not.toBeNull();

		let isolatedScope = <AddNameScope>addName.isolateScope();
		expect(isolatedScope.list).toBe(scope.names);

		let ctrl = (<any>isolatedScope).an;
		expect(ctrl.isDisabled).toBe(true);
		expect(ctrl.addNameTooltip).toBe('Need a name');
	});

	it('should disable if name exists', () =>
	{
		scope.names = [ 'alpha', 'beta' ];
		let addName = compile('<add-name list="names"></add-name>')(scope);
		scope.$digest();

		expect(addName).not.toBeNull();

		let isolatedScope = <AddNameScope>addName.isolateScope();
		let ctrl = (<any>isolatedScope).an;
		ctrl.name = scope.names[0];
		ctrl.check();

		expect(ctrl.isDisabled).toBe(true);
		expect(ctrl.addNameTooltip).toBe('Duplicate name');
	});

	it('should emit an event when asked to add a name', () =>
	{
		scope.names = [ 'one', 'two' ];
		let addName = compile('<add-name list="names"></add-name>')(scope);
		scope.$digest();

		expect(addName).not.toBeNull();

		let isolatedScope = <AddNameScope>addName.isolateScope();
		spyOn(isolatedScope, '$emit');

		let ctrl = (<any>isolatedScope).an;
		ctrl.name = 'three';
		ctrl.check();

		expect(ctrl.isDisabled).toBe(false);
		expect(ctrl.addNameTooltip).toBe('Add a new name');

		ctrl.add();

		expect(isolatedScope.$emit).toHaveBeenCalledWith('AddName', ctrl.name);
	});
});
