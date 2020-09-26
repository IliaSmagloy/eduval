const knex = require('knex');
const middy = require('middy');
const {
	cors, httpErrorHandler, jsonBodyParser, validator,
} = require('middy/middlewares');
const createError = require('http-errors');
const auth0 = require('auth0');
const dbConfig = require('../../db');
const corsConfig = require('../../cors');

function isAnInteger(obj) {
	return !Number.isNaN(Number(obj)) && Number.isInteger(Number(obj));
}

// POST course/{courseId}/registeredIds
const addCourseRegisteredById = async (event, context, callback) => {
	if (!event.pathParameters.courseId) {
		return callback(createError.BadRequest("Course's ID required."));
	}
	if (!isAnInteger(event.pathParameters.courseId)) {
		return callback(createError.BadRequest('ID should be an integer.'));
	}

	const requestArray = JSON.parse(event.body);

	if (requestArray.length === 0) {
		return callback(null, {
			statusCode: 200,
			body: '',
		});
	}
	const pairsArray = requestArray.map(x => ({
		studentId: x,
		courseId: event.pathParameters.courseId,
	}));

	const knexConnection = knex(dbConfig);

	return knexConnection('Registered').insert(pairsArray)
		.then(() => {
			knexConnection.client.destroy();
			return callback(null, {
				statusCode: 200,
				body: '',
			});
		})
		.catch((err) => {
			// Disconnect
			knexConnection.client.destroy();
			// eslint-disable-next-line no-console
			if (err.code === 'ER_DUP_ENTRY') {
				return callback(null, {
					statusCode: 200,
					body: '',
				});
			}
			console.log(`ERROR registering students: ${err}`);
			return callback(createError.InternalServerError('Error registering students.'));
		});
};

const schema = {
	type: 'array',
	items: {
		type: 'string',
	},
};

const handler = middy(addCourseRegisteredById)
	.use(jsonBodyParser())
	.use(validator({
		inputSchema: {
			type: 'object',
			properties: {
				body: schema,
			},
		},
	}))
	.use(httpErrorHandler())
	.use(cors(corsConfig));

module.exports = { handler };
