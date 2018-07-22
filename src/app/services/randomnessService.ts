import * as angular from 'angular';
import { methodDecoratorTwo, methodDecoratorOne, classDecoratorTwo, classDecoratorThree, classDecoratorOne } from 'decorators/ts-decorators';

// Yeah, it is a stupid service, just needed something simple for demonstration...
@classDecoratorThree
@classDecoratorTwo('Randomness', 'Generating randomness')
@classDecoratorOne
export class Randomness<T>
{
	@methodDecoratorTwo
	@methodDecoratorOne('getFromArray', 'Get a random thing from an array of things')
	public getFromArray(array: Array<T>, previous?: T): T | undefined
	{
		let itemNb = array.length;
		if (itemNb === 0) return undefined;
		if (itemNb === 1) return array[0];
		let item = previous; // Can be undefined, eg. on first call
		while (item === previous)
		{
			let random = Math.floor(Math.random() * itemNb);
			item = array[random];
		}
		return item;
	}
}

// Reusable service is isolated in its own module, can be moved to another app.
export const randomnessModule = angular.module('services.randomness', [])
	.service('randomness', Randomness)
	.name;
