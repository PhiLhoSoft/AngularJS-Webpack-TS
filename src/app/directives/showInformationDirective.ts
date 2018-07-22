import * as angular from 'angular';

interface ShowInformationScope extends ng.IScope
{
	name: string;
	text: string;
	value1: number;
	value2: number;
	value3: string;
	options: any;
	info: any;
	method: Function;
	callback: Function;
	oneWay1: any;
	oneWay2: number;
	oneWay3: number;

	sendAlert: Function;
}

export class ShowInformationDirective implements ng.IDirective
{
	public restrict = 'E';
	public template = `
	<div style="border: 1px solid green; padding: 4px;">
	Information for @{{name}} (@{{value1}} &amp; ={{value2}} &amp; ={{value3}}) One-time binding: {{::value3}})<br>
	@<i>{{text}}</i><br>
	Options = {{options | json}}<br>Info = {{info | json}}<br>
	One way: {{oneWay1 | json}} - {{oneWay2}} - {{oneWay3}}<br>
	Change name: <input type="text" ng-model="name" ng-change="info.currentName = name"/><br>
	<input type="button" value="Transmit" ng-click="method({ feedback: name })"/>
	<input type="button" value="Alert" ng-click="sendAlert(name, info.age)"/>
	</div>
	`;
	public scope =
	{
		// @ --> text binding / one-way binding: expect attribute value to be a plain string or an expression within {{}} giving a plain string
		name: '@',
		text: '@',
		value1: '@',
		// = --> direct model binding / two-way binding: expect attribute value to be an expression to be evaluated
		value2: '=',
		value3: '=',
		options: '=',
		info: '=',
		// & --> behavior binding / method binding: expect attribute value to be a method call
		method: '&',
		callback: '&',
		// < --> one-way binding
		oneWay1: '<',
		oneWay2: '<',
		oneWay3: '<',
	};
	/* Directive used as such:
	<show-information
		name="{{about.userName}}" --> text, interpolated value (actually simple expression)
		text="Some random text" --> text, literal text, kept as is
		value1="{{about.userName.length * 2}}" --> text, interpolated expression
		value2="about.userName.length * 2" --> model, literal expression
		value3="about.userName" --> model, string value (expression)
		options="{ opt1: 42, opt2: 'foooo', opt3: about.userName }" --> model, literal object (still expression)
		info="about.userInfo" --> model, object value
		method="about.update(feedback)" --> callback, argument feedback is a key of the object passed as parameter of method() call in the directive
		callback="about.alert(foo)" --> idem
		one-way-1="about.userInfo" --> one-way-binding on object
		one-way-2="about.userInfo.weight" --> one-way-binding on value inside object
		one-way-3="about.userAge" --> one-way-binding on value
		></show-information>
	*/

	public static factory(): ng.IDirectiveFactory
	{
		const directive = () =>
		{
			return new ShowInformationDirective();
		};

		directive.$inject = [];

		return directive;
	}

	public constructor()
	{
	}

	public link(scope: ShowInformationScope, element: ng.IAugmentedJQuery, attributes: ng.IAttributes)
	{
		console.log('ShowInformation:', 'attributes', attributes, 'scope', scope);
		scope.sendAlert = (name: string, age: number) => {
			scope.info.age++; // Will update in parent template, because of double-binding
			scope.value3 += '.'; // userName is updated because of two-way binding
			scope.oneWay2++; // weight is updated upward: one-way binding, but on reference, if object changes internally, the info changes upward
			scope.oneWay3++; // Not propagated upward
			scope.callback({ foo: name, bar: age * 2 });
		};
	}
}

export const informationModule = angular.module('directives.information', [])
	.directive('showInformation', ShowInformationDirective.factory())
	.name;
