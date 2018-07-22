var faker = require("faker");

var appRouter = function (app)
{
	var users = [];

	app.get("/", function (req, res)
	{
		res.status(200).send({ message: 'PhiLhoSoft User API' });
	});

	app.get("/users", function (req, res)
	{
		res.status(200).send(users);
	});

	app.get("/users/:id", function (req, res)
	{
		var id = req.params.id;
		if (!isFinite(id) || id <= 0 || id > users.length)
		{
			res.status(400).send({ message: 'Invalid user id' });
			return;
		}

		res.status(200).send(users[id - 1]);
	});

	app.post("/users", function (req, res)
	{
		var id = users.length + 1;
		var answer =
		{
			id: id,
			firstName: req.body.name,
			lastName: faker.name.lastName(),
			userName: faker.internet.userName(),
			email: faker.internet.email(),
		};
		users.push(answer);
		res.status(200).send(answer);
	});

	function createUsers(number)
	{
		for (i = 0; i < number; i++)
		{
			var id = i + 1;
			users.push(
				{
					id: id,
					firstName: faker.name.firstName(),
					lastName: faker.name.lastName(),
					userName: faker.internet.userName(),
					email: faker.internet.email(),
				}
			);
		}
	}
}

module.exports = appRouter;
