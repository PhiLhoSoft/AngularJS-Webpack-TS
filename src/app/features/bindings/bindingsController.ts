interface UserInfo
{
	name: string;
	country: string;
	tick: string;
	age: number;
	weight: number;
}

export class BindingsController implements ng.IController
{
	public userName: string;
	public userCountry: string;
	public userAge: number;
	public userWeight: number;
	public userInfo: UserInfo;
	public oneTime: number;

	public constructor()
	{
		// Simple variable, string
		this.userName = 'Jean-Jacques';
		this.userCountry = 'Italy';
		// Simple variable, number
		this.userAge = 42;
		this.userWeight = 66;
		// Object
		this.userInfo =
		{
			name: 'Pierre-Paul',
			country: 'Germany',
			tick: '#',
			age: 99,
			weight: 100,
		};
	}

	// Called from template
	public changeUser()
	{
		this.userName = this.userInfo.name = this.userName.split('').reverse().join('');
		this.userCountry = this.userCountry.substring(0, this.userCountry.length - 1);
		this.userAge--;
		this.userWeight--;
		this.userInfo.country = this.userInfo.country.substring(0, this.userInfo.country.length - 1);
		this.userInfo.age--;
		this.userInfo.weight--;
		// Initially empty (undefined -> empty by Angular binding). Upon first init, display the value. Won't update later.
		this.oneTime = this.userAge;
	}

	// Given to directive, called from its template
	public update(name: string)
	{
		this.userName = name ? name.toUpperCase() : '(unknown)';
		this.userAge++;
		this.userCountry += '!';
	}

	// Given to directive, called from its code
	public changeUserInfo(name: string, age: number)
	{
		this.userInfo.name = name || '(nobody)';
		this.userInfo.age = age;
	}
}
