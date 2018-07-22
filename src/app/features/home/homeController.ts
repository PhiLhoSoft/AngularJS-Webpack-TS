import { NameModel } from '@model/nameModel';
import { Randomness } from '@services/randomnessService';

export class HomeController
{
	public static $inject = [ 'nameModel', 'randomness' ];

	public name: string | undefined;

	public constructor(
		private nameModel: NameModel,
		private randomness: Randomness<string>
	)
	{
		this.name = 'World';
	}

	public changeName()
	{
		this.name = this.nameModel.applicationName;
	}

	public randomizeName()
	{
		this.name = this.randomness.getFromArray(this.nameModel.names);
	}
}
