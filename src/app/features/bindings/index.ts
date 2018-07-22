import * as angular from 'angular';

import { ShowInformationDirective } from './showInformationDirective';
import { BindingsController } from './bindingsController';

export const bindingsModule = angular.module('app.bindings', [])
	.directive('showInformation', ShowInformationDirective.factory())
	.controller('BindingsController', BindingsController)
	.name;
