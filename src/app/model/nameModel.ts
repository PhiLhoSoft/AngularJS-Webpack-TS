export class NameModel
{
	public static $inject = [ '$http', '$q', '$log' ];

	public applicationName: string;

	public names: Array<string> = [];

	private readonly url = 'http://localhost:3000/users';

	constructor(private $http: ng.IHttpService, private $q: ng.IQService, private $log: angular.ILogService)
	{
		this.applicationName = 'Webpack AngularJS with TypeScript Demo';
		// Fallback
		this.names = [ 'John', 'Elisa', 'Mark', 'Annie', 'Reginald', 'Alexandra', 'Benjamin', 'Florian', 'Clement', 'Philippe' ];
		this.fetchNames()
			.then((names: any) => { this.names = names; })
			.catch((error: any) => { /* Ignore, already reported. */ });
	}

	public addName(name: string)
	{
		// Immediate feedback
		this.names.push(name);

		// Send to server, and update with real data, asynchronously
		this.$http.post(this.url, { name })
			.then(response => { this.fetchNames(); })
			.catch(error =>
			{
				this.$log.error('Error while updating list of users');
			});
	}

	private fetchNames(): ng.IPromise<Array<string>>
	{
		return this.$http.get<Array<string>>(this.url)
			.then((response: any) =>
			{
				this.names = response.data.map((user: any) => user.firstName);
				return this.names;
			})
			.catch(error =>
			{
				this.$log.error('Unable to get list of users');
				return this.$q.reject(error);
			});
	}
}
