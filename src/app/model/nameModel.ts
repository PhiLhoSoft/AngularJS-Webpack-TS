export class NameModel
{
	public applicationName: string;
	public names: Array<string>;

	contructor()
	{
		this.applicationName = 'Webpack AngularJS with TypeScript Demo';
		this.names = [ 'John', 'Elisa', 'Mark', 'Annie', 'Reginald', 'Alexandra', 'Benjamin', 'Florian', 'Clement', 'Philippe' ];
	}

	public add(name: string)
	{
		this.names.push(name);
	}
}
