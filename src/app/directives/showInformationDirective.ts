import * as angular from 'angular';

interface ShowInformationScope extends ng.IScope
{
	name: string;
	text: string;
	// All @ bindings result in string values
	atModelBinding: string;
	atExprBinding: string;
	atModelBindingOneTime: string;
	atExprBindingOneTime: string;
	atObjectBinding: string;
	// = and < bindings result in the real typed values
	eqModel: string;
	eqExpr: number;
	eqExprOneTime: number;
	eqOptions: any;
	eqObject: any;
	eqBooleanExpr: boolean;
	eqBooleanConstant: boolean;
	ltObject: any;
	ltProperty: number;
	ltValue: number;
	// & bindings are functions, of course
	method: Function;
	callback: Function;

	updateUserInfo: Function;
	tickValue: string;
	watch: string; // Observed value
	_watch: string; // Storage of previous one
}

export class ShowInformationDirective implements ng.IDirective
{
	public restrict = 'E';
	public template = `
	<div style="border: 3px solid lightgreen; padding: 8px;">
		<div style="border: 1px solid green; padding: 4px;"><span style="font-size: large; color: limegreen;">@</span><br>
			userName: {{name}}<br>
			Plain text: {{text}}<br>
			Model binding: {{atModelBinding}}<br>
			Expression binding: {{atExprBinding}}<br>
			Model binding one-time: {{atModelBindingOneTime}}<br>
			Expression binding one-time: {{atExprBindingOneTime}}<br>
			Object binding: {{atObjectBinding}}<br>
		</div>
		<div style="border: 1px solid green; padding: 4px;"><span style="font-size: large; color: limegreen;">=</span><br>
			Two-way binding, model: {{eqModel}}<br>
			Two-way binding, expression: {{eqExpr}}<br>
			Two-way binding, expression, one-time: {{eqExprOneTime}}<br>
			Two-way binding, options = {{eqOptions | json}}<br>
			Two-way binding, object = {{eqObject | json}}<br>
			Object one-time binding in directive template = {{:: eqObject | json}}<br>
			Boolean expression and constant = {{eqBooleanExpr}} {{eqBooleanConstant}}<br>
		</div>
		<div style="border: 1px solid green; padding: 4px;"><span style="font-size: large; color: limegreen;">&lt;</span><br>
			One-way binding, object: {{ltObject | json}}<br>
			One-way binding, property: {{ltProperty}}<br>
			One-way binding, value: {{ltValue}}<br>
		</div>
		<div style="border: 1px solid green; padding: 4px;"><span style="font-size: large; color: limegreen;">&</span><br>
			Change name: <input type="text" style="height: 20px;" ng-model="name" ng-change="ltObject.name = name.toLowerCase()"/> (change object's name)<br>
			<input type="button" value="Transmit name" ng-click="method({ feedback: name })"/>
			<input type="button" value="Update user info" ng-click="updateUserInfo(name, eqObject.age)"/>
			<input type="text" style="width: 30px; height: 20px;" ng-model="tickValue" ng-change="watch = tickValue ? tickValue.charAt(0) : '#'; tickValue = ''"/>={{watch}}=<br>
		</div>
	</div>
	`;
	public scope =
	{
		// @ --> text binding / one-way binding: expect attribute value to be a plain string or an expression within {{}} giving a plain string
		name: '@', // Sent via two-way binding {{ }} on userName
		text: '@', // Plain text in template
		atModelBinding: '@', // Sent via two-way binding {{ }} on userAge
		atModelBindingOneTime: '@', // Sent via one-time binding {{:: }}
		atExprBinding: '@', // Sent via expression interpolation {{ }}
		atExprBindingOneTime: '@', // Sent via one-time binding {{:: }}
		atObjectBinding: '@', // Sent via expression interpolation {{ }}
		// = --> direct model binding / two-way binding: expect attribute value to be an expression to be evaluated
		eqModel: '=',
		eqExpr: '=',
		eqExprOneTime: '=',
		eqOptions: '=',
		eqObject: '=',
		eqBooleanExpr: '=', // Eg, foo-bar="ctrl.foo === ctrl.bar": AngularJS makes a binding for this one
		eqBooleanConstant: '=', // Typically, foo-bar="true": AngularJS evaluates the value but doesn't make a binding because it is constant
		// < --> one-way binding
		ltObject: '<',
		ltProperty: '<',
		ltValue: '<',
		// & --> behavior binding / method binding: expect attribute value to be a method call
		method: '&',
		callback: '&',
	};
	/* Directive used as such:
	<show-information
		name="{{about.userName}}"
		text="Some random text"
		at-model-binding="{{about.userAge}}"
		at-model-binding-one-time="{{:: about.userAge}}"
		at-expr-binding="{{about.userInfo.country.length * 2}}"
		at-expr-binding-one-time="{{:: about.userInfo.country.length * 2}}"
		at-object-binding="{{about.userInfo}}"
		eq-model="about.userCountry"
		eq-expr="about.userInfo.country.length * 2"
		eq-expr-one-time=":: about.userInfo.country.length * 2"
		eq-options="{ opt1: 111, opt2: about.userCountry, opt3: about.userInfo.weight }"
		eq-object="about.userInfo"
		eq-boolean-expr="about.userInfo.country.length % 2 === 0"
		eq-boolean-constant="true"
		lt-object="about.userInfo"
		lt-property="about.userInfo.weight"
		lt-value="about.userWeight"
		method="about.update(feedback)"
		callback="about.changeUserInfo(foo, bar)"
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
		scope.updateUserInfo = (name: string, age: number) => {
			// No point in updating @ bindings
			scope.eqModel += Math.floor(1 + 9 * Math.random()); // userCountry is updated because two-way binding
			scope.eqObject.tick += '.'; // userInfo.tick is updated because of reference to object
			scope.eqOptions.opt3 *= 1.5; // Options are defined in the template, changes in the directive don't go upward
			scope.ltObject.country += '-'; // userInfo.country is updated, despite one-way binding, because binding is done on object reference, property changes go both ways
			scope.ltProperty++; // userInfo.weight is not updated, because of one-way binding on the property, but it is updated locally
			scope.ltValue += 5; // userWeight is not updated either, local update
			scope.callback({ foo: name, bar: age * 2 });
			scope.watch = '@';
		};
		Object.defineProperty(scope, 'fullName',
		{
			get: () => `${scope.name} (${scope.atModelBinding})`,
		});
		Object.defineProperty(scope, 'watch',
		{
			set(v) { scope.eqObject.tick += v; scope._watch = v; },
			get() { return scope._watch; },
		});
	}
}

export const informationModule = angular.module('directives.information', [])
	.directive('showInformation', ShowInformationDirective.factory())
	.name;
