// TypeScript decorators.
// Shows how decorators compose, how to pass parameters.
// For classes, shows how to enrich a class and alter the constructor.

// Standalone code, doesn't fit in the app, actually.
// But this code can just be pasted into the TS playground... https://www.typescriptlang.org/play/

// tslint:disable no-console // These are for demo purpose
// tslint:disable member-access // Simpler
// .editorconfig:
// indent_style = tab
// indent_size = 4

import 'reflect-metadata';

function simpleClassDecorator(
	target: any // The class the decorator is declared on
): void
{
	console.log('simpleClassDecorator evaluated on:', target);
	// A simple way to alter the class
	target.prototype.simpleNewMethod = () => { console.log('New method'); };
}
// Decorator with parameters
function otherClassDecorator<T extends { new(...args: any[]): {} }>(
	name: string
): any
{
	console.log('otherClassDecorator evaluated with:', name);
	return (
		target: T // Decorated class
	): T =>
	{
		console.log('otherClassDecorator called on:', target, 'with', name);
		return class extends target
		{
			zeta: string;
			constructor(...args: any[])
			{
				const x = args[0];
				console.log('otherClassDecorator: constructing altered class with:', x);
				if (typeof x === 'number')
				{
					args[0] = x * 10;
				}
				super(...args);
				this.zeta = x;
			}
			other() { console.log('Other method:', this.zeta); }
		};
	};
}
// Similar but simpler, without parameters
function changingClassDecorator<T extends { new(...args: any[]): {} }>(
	target: T // The class the decorator is declared on
): T
{
	console.log('changingClassDecorator called on:', target);
	return class extends target
	{
		beta: string;
		constructor(...args: any[])
		{
			const x = args[0];
			console.log('changingClassDecorator: constructing decorated class with:', x);
			if (typeof x === 'number')
			{
				args[0] = x * 2;
			}
			super(...args);
			this.beta = x;
		}
		added() { console.log('Added method:', this.beta); }
	};
}

// Without parameters, return directly the altered method
function methodDecorator(
	target: any, // Prototype of the class hosting the method
	propertyKey: string, // Name of the decorated method
	descriptor: PropertyDescriptor // Information to override
): PropertyDescriptor
{
	console.log('methodDecorator called on:', target, 'method:', propertyKey, 'descriptor:', descriptor);
	// Save a reference to the original method to keep the values currently in the
	// descriptor and don't overwrite what another decorator might have done to the descriptor.
	const originalMethod = descriptor.value;

	// Editing the descriptor's value parameter
	descriptor.value = function decorated() // Use 'function' form to get the arguments list
	{
		console.log('methodDecorator, call of the decorated method:', propertyKey);
		return originalMethod.apply(this, arguments);
	};

	// Return edited descriptor as opposed to overwriting the descriptor
	return descriptor;
}
// With parameters, return a function which alters the given method
function otherMethodDecorator(n: number)
{
	console.log('otherMethodDecorator evaluated');
	return (
		target: any, // Prototype of the class hosting the method
		propertyKey: string, // Name of the decorated method
		descriptor: PropertyDescriptor // Information to override
	): PropertyDescriptor =>
	{
		console.log('otherMethodDecorator called on:', target, 'method:', propertyKey, 'descriptor:', descriptor);
		const originalMethod = descriptor.value;
		descriptor.value = function decorated()
		{
			console.log('otherMethodDecorator, call of the decorated method:', propertyKey);
			const p = arguments[0];
			if (p !== undefined)
			{
				let d = '';
				for (let i = 0; i < n; i++) { d += p; }
				arguments[0] = d;
			}
			return originalMethod.apply(this, arguments);
		};

		return descriptor;
	};
}
// Work with the percentage parameter decorator
const percentageMetadataKey = Symbol('percentage');
function applyPercentage(
	target: any, // Prototype of the class hosting the method
	propertyKey: string, // Name of the decorated method
	descriptor: PropertyDescriptor // Information to override
): PropertyDescriptor
{
	console.log('applyPercentage called on:', target, 'method:', propertyKey, 'descriptor:', descriptor);
	const originalMethod = descriptor.value;
	descriptor.value = function decorated() {
		console.log('applyPercentage: call of the decorated method:', propertyKey);
		// let percentageParameters: number[] = Reflect.getOwnMetadata(percentageMetadataKey, target, propertyKey);
		let percentageParameters: number[] = target[percentageMetadataKey] || [];
		for (let i = 0; i < arguments.length; i++)
		{
			if (percentageParameters.indexOf(i) >= 0)
			{
				arguments[i] /= 100;
			}
		}
		return originalMethod.apply(this, arguments);
	};

	return descriptor;
}

// Property decorator with parameters, must return a function that do the decoration
function trimmer(precision: number)
{
	const factor = 10 ** precision;
	console.log('trimmer evaluated:', precision, '->', factor);
	return (target: any, key: string): void =>
	{
		console.log('trimmer called on:', target, 'key', key);
		let property = this[key];
		const getter = () => property;
		const setter = (value: number) => { property = Math.floor(value * factor) / factor; };
		// Remove the property
		delete this[key];
		// And recreate it with getter and setter defined above
		Object.defineProperty(target, key,
			{
				get: getter,
				set: setter,
				enumerable: true,
				configurable: true
			});
	};
}
// Property decorator without parameters
function changer(target: any, propertyKey: string)
{
	const type = typeof this[propertyKey];
	console.log('changer evaluated on:', target, 'propertyKey:', propertyKey, 'type:', type);
	delete this[propertyKey];
	let value: any;
	Object.defineProperty(target, propertyKey,
		{
			get: () => value,
			set: (newValue) => { value = newValue ? newValue.toUpperCase().replace(/E/g, '3') : newValue; },
			enumerable: true,
			configurable: true
		});
}

// Parameter decorator, mark the property to be handled later
function percentage(target: any, propertyKey: string, parameterIndex: number)
{
	const type = typeof this[propertyKey];
	console.log('percentage evaluated on:', target, 'propertyKey:', propertyKey, 'type:', type);
	// let percentageParameters: number[] = Reflect.getOwnMetadata(percentageMetadataKey, target, propertyKey) || [];
	let percentageParameters: number[] = target[percentageMetadataKey] || [];
	percentageParameters.push(parameterIndex);
	// Reflect.defineMetadata(percentageMetadataKey, percentageParameters, target, propertyKey);
	target[percentageMetadataKey] = percentageParameters;
}

@simpleClassDecorator // Applied last (on class decorated by following one)
@otherClassDecorator('Decore') // Applied second (idem)
@changingClassDecorator // First applied (on original class)
class ClassDecoratorExample
{
	alpha: string;
	population: number;
	rate: number;
	subPop: number;
	subRate: number;
	@changer
	name = 'Default';
	@trimmer(2)
	value1: number;
	@trimmer(5)
	value2: number;

	constructor(x: number)
	{
		this.alpha = `v-${x}`;
		this.value1 = this.value2 = 3.1415926;
	}

	@applyPercentage // Should do nothing...
	@methodDecorator
	foo() { console.log('foo is called, alpha is ' + this.alpha); }

	@methodDecorator
	@otherMethodDecorator(3)
	bar(p: string)
	{
		this.alpha += '; ' + p;
		console.log('Added ' + p + ' giving "' + this.alpha + '".');
	}

	@applyPercentage
	setStatistics(population: number, @percentage rate: number, subPop: number, @percentage subRate: number)
	{
		this.population = population;
		this.rate = rate;
		this.subPop = subPop;
		this.subRate = subRate;
	}
}

console.log('----- Starting the application -----');
let cde = new ClassDecoratorExample(42);
cde.foo();
(<any>cde).simpleNewMethod();
(<any>cde).added();
(<any>cde).other();
cde.bar('yo');
console.log(cde.name);
console.log(cde.value1, '/', cde.value2);
cde.name = 'Big value';
cde.value1 = cde.value2 = 2.71828;
console.log(cde.name);
console.log(cde.value1, '/', cde.value2);
cde.setStatistics(100_000, 55, 2_000, 67);
console.log('Statistics', cde.population, cde.rate, cde.subPop, cde.subRate);
