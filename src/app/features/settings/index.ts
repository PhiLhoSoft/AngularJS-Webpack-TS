import { angular } from 'angular';
import { uirouter } from 'angular-ui-router';

import { AddNameDirective } from './addNameDirective';
import { AddNameController } from './addNameController';
import { SettingsController } from './settingsController';

import './settings.styl';

export const settingsModule = angular.module('app.settings', [ uirouter ])
	.directive('addName', AddNameDirective)
	.controller('AddNameController', AddNameController)
	.controller('SettingsController', SettingsController)
	.name;
