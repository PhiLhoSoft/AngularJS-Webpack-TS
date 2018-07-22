// Entry point for the 'model' module, exposing several (only one here...) services holding the application's model.

import * as angular from 'angular';

import { NameModel } from './nameModel';

export const modelModule = angular.module('app.model', [])
	.service('nameModel', NameModel)
	.name;
