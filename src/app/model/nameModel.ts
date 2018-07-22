import { Events } from './events';
import { methodDecoratorOne } from 'decorators/ts-decorators';

export class NameModel
{
	public static $inject = [ '$rootScope', '$http', '$q', '$log' ];

	public applicationName: string;

	public names: Array<string> = [];

	private readonly url = 'http://localhost:3000/users';

	public constructor(
		private $rootScope: ng.IRootScopeService,
		private $http: ng.IHttpService,
		private $q: ng.IQService,
		private $log: angular.ILogService
	)
	{
		this.applicationName = 'Webpack AngularJS with TypeScript Demo';
		// Fallback
		this.names = [ 'placeholder', 'Webpack', 'AngularJS', 'TypeScript', 'Demo' ];
		this.fetchNamesAndNotify();
	}

	@methodDecoratorOne('NameModel.addName', 'Send a name to server')
	public addName(name: string)
	{
		// Send to server, and update with real data, asynchronously
		this.$http.post(this.url, { name })
			.then(response => { this.fetchNamesAndNotify(); })
			.catch(error =>
			{
				this.$log.error('Error while updating list of users');
			});
	}

	private fetchNamesAndNotify()
	{
		this.fetchNames()
			.then((names: Array<string>) =>
			{
				this.names = names;
				this.$rootScope.$emit(Events.namesUpdate, names);
			})
			.catch((error: any) => { this.$log.error('Unable to get list of users', error); });
	}

	@methodDecoratorOne('NameModel.fetchNames', 'Get names from server')
	private fetchNames(): ng.IPromise<Array<string>>
	{
		return this.$http.get<Array<string>>(this.url)
			.then((response: any) =>
			{
				return response.data.map((user: any) => user.firstName);
			})
			.catch(error =>
			{
				return this.$q.reject(error);
			});
	}
}
