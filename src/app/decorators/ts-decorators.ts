// TypeScript decorator definitions

// tslint:disable no-console // These are for demo purpose

// Class decorator
export function classDecoratorOne(target: Function) {
	console.log('classDecoratorOne: evaluated for:', target);
}

export function classDecoratorTwo<T extends { new(...args: any[]): {} }>(name: string, description?: string): any {
	console.log('classDecoratorTwo: evaluated with:', name, 'description:', description);
	return (target: T): T => {
		console.log('classDecoratorTwo: instantiated:', name, 'with:', name, description);
		return class extends target
		{
			constructor(...args: any[])
			{
				super(...args);
			}
		};
	};
}

export function classDecoratorThree<T extends { new(...args: any[]): {} }>(
	target: T // The class the decorator is declared on
): T
{
	console.log('classDecoratorThree called on:', target);
	return class extends target
	{
		private argumentNb: number;
		constructor(...args: any[])
		{
			super(...args);
			this.argumentNb = args.length;
			console.log('classDecoratorThree: constructing decorated class with', this.argumentNb, 'arguments, scope:', args[0]);
		}
		public added() { console.log('Added method:', (<any>this).addNameTooltip); }
	};
}

// Method decorator
export function methodDecoratorOne(name: string, description?: string) {
	console.log('methodDecoratorOne: evaluated with:', name, description);
	return (
		target: any, // Prototype of the class hosting the method
		propertyKey: string, // Name of the decorated method
		descriptor: PropertyDescriptor // Information to override
	) => {
		console.log('methodDecoratorOne: called for:', target, 'method:', propertyKey, 'descriptor:', descriptor);
		// Save a reference to the original method to keep the values currently in the
		// descriptor and don't overwrite what another decorator might have done to the descriptor.
		const originalMethod = descriptor.value;

		// Editing the descriptor's value parameter
		descriptor.value = function decorated() { // Use 'function' form to get the arguments list
			console.log('methodDecoratorOne: decorated method:', propertyKey, 'called with:', name);
			const args = arguments;
			const method = () => originalMethod.apply(this, args);
			return method();
		};

		// Return edited descriptor as opposed to overwriting the descriptor
		return descriptor;
	};
}

export function methodDecoratorTwo(
	target: any, // Prototype of the class hosting the method
	propertyKey: string, // Name of the decorated method
	descriptor: PropertyDescriptor // Information to override
): PropertyDescriptor {
	console.log('methodDecoratorTwo: evaluated for:', target, 'method:', propertyKey, 'descriptor:', descriptor);

	// Save a reference to the original method to keep the values currently in the
	// descriptor and don't overwrite what another decorator might have done to the descriptor.
	const originalMethod = descriptor.value;

	// Editing the descriptor's value parameter
	descriptor.value = function decorated() { // Use 'function' form to get the arguments list
		console.log('methodDecoratorTwo: decorated method:', propertyKey);
		return originalMethod.apply(this, arguments);
	};

	// Return edited descriptor as opposed to overwriting the descriptor
	return descriptor;
}
