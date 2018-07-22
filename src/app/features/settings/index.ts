import * as angular from 'angular';

import { AddNameDirective } from './addNameDirective';
import { AddNameController } from './addNameController';
import { SettingsController } from './settingsController';

import 'settings.styl';

export const settingsModule = angular.module('app.settings', [])
	.directive('addName', AddNameDirective.factory())
	.controller('AddNameController', AddNameController)
	.controller('SettingsController', SettingsController)
	.name;
