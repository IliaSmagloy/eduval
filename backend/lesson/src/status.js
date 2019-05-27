const knex = require('knex');
const middy = require('middy');
const {
	cors, httpErrorHandler, httpEventNormalizer, validator,
} = require('middy/middlewares');
const createError = require('http-errors');
const dbConfig = require('../db');
const corsConfig = require('../cors');
const iot = require('./Notifications');

function isAnInteger(obj) {
	return !Number.isNaN(Number(obj)) && Number.isInteger(Number(obj));
}

// GET lesson/{courseId}/status
const getLessonStatus = async (event, context, callback) => {
	if (!event.pathParameters.courseId) {
		return callback(createError.BadRequest("Course's ID required."));
	}
	if (!isAnInteger(event.pathParameters.courseId)) {
		return callback(createError.BadRequest('ID should be an integer.'));
	}

	// Connect
	const knexConnection = knex(dbConfig);

	return knexConnection('Courses')
		.where({
			courseId: event.pathParameters.courseId,
		})
		.select()
		.then((result) => {
			knexConnection.client.destroy();

			if (result.length === 1) {
				callback(null, {
					statusCode: 200,
					body: result[0].status,
				});
			} else if (result.length === 0) {
				callback(createError.NotFound('Course not found.'));
			} else {
				callback(createError.InternalServerError('More than one course with this ID.'));
			}
		})
		.catch((err) => {
			// Disconnect
			knexConnection.client.destroy();
			// eslint-disable-next-line no-console
			console.log(`ERROR getting course status: ${JSON.stringify(err)}`);
			return callback(createError.InternalServerError('Error getting course status.'));
		});
};

// POST lesson/{courseId}/status
const updateLessonStatus = async (event, context, callback) => {
	// context.callbackWaitsForEmptyEventLoop = false
	if (!event.pathParameters.courseId) {
		return callback(createError.BadRequest("Course's ID required."));
	}
	if (!isAnInteger(event.pathParameters.courseId)) {
		return callback(createError.BadRequest('ID should be an integer.'));
	}

	const newStatus = event.body;

	// Connect
	const knexConnection = knex(dbConfig);

	return knexConnection('Courses')
		.where({
			courseId: event.pathParameters.courseId,
		})
		.update({ status: newStatus })
		.then(async (result) => {
			if (result === 1) {
				new Promise((resolve, reject) => {
					if (newStatus === 'LESSON_END') {
						// then we need to clear out the present students
						const promise = knexConnection('PresentStudents').where({
							courseId: event.pathParameters.courseId,
						}).del();
						resolve(promise);
					}
					resolve();
				}).then(() => {
					knexConnection.client.destroy();

					iot.connect().then(() => {
						iot.client.publish(`lesson/${event.pathParameters.courseId}/status`, newStatus, {}, (uneededResult) => {
							iot.client.end(false);
							callback(null, {
								statusCode: 200,
								body: '',
							});
						});
					});
				});
			} else if (result.length === 0) {
				callback(createError.NotFound('Course not found.'));
			} else {
				callback(createError.InternalServerError('More than one course (with same ID) updated.'));
			}
		})
		.catch((err) => {
			// Disconnect
			knexConnection.client.destroy();
			// eslint-disable-next-line no-console
			console.log(`ERROR updating status: ${JSON.stringify(err)}`);
			return callback(createError.InternalServerError('Error updating status.'));
		});
};

const get = middy(getLessonStatus)
	.use(cors(corsConfig))
	.use(httpEventNormalizer())
	.use(httpErrorHandler());

const schema = {
	type: 'string',
	enum: ['LESSON_START', 'LESSON_END'],
};

const post = middy(updateLessonStatus)
	.use(cors(corsConfig))
	.use(validator({
		inputSchema: {
			type: 'object',
			properties: {
				body: schema,
			},
		},
	}))
	.use(httpErrorHandler());

module.exports = { get, post };