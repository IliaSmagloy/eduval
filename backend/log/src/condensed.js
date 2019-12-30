const knex = require('knex');
const middy = require('middy');
const {
	cors, httpErrorHandler, httpEventNormalizer,
} = require('middy/middlewares');
const createError = require('http-errors');
const dbConfig = require('../db');
const corsConfig = require('../cors');

function numToEmoji(num) {
	let emoji;
	switch (num) {
	case 0:
		emoji = 'EMOJI_HAPPY';
		break;
	case 1:
		emoji = 'EMOJI_THUMBS_UP';
		break;
	case 2:
		emoji = 'EMOJI_ANGEL';
		break;
	case 3:
		emoji = 'EMOJI_GRIN';
		break;
	case 4:
		emoji = 'EMOJI_SHUSH';
		break;
	case 5:
		emoji = 'EMOJI_ZZZ';
		break;
	case 6:
		emoji = 'EMOJI_ANGRY';
		break;
	case 7:
		emoji = 'EMOJI_THUMBS_DOWN';
		break;
	default:
		emoji = 'ERROR_EMOJI';
	}
	return emoji;
}

function isAnInteger(obj) {
	return !Number.isNaN(Number(obj)) && Number.isInteger(Number(obj));
}

// GET log/condensed/{studentId}/byCourse/{courseId}
const getCondensedLog = async (event, context, callback) => {
	if (!event.pathParameters.courseId || !event.pathParameters.studentId) {
		return callback(createError.BadRequest("Student's and course's IDs required."));
	}
	if (!isAnInteger(event.pathParameters.courseId)) {
		return callback(createError.BadRequest('Course ID should be an integers.'));
	}

	const studentId = decodeURI(event.pathParameters.studentId);

	// Connect
	const knexConnection = knex(dbConfig);
	const toRet = [];

	return knexConnection('Logs')
		.max('lessonNumber')
		.where({
			courseId: event.pathParameters.courseId,
			studentId,
		})
		.then((result) => {
			for (let i = 0; i <= result[0]['max(`lessonNumber`)']; i += 1) {
				toRet.push({
					emons: 0,
					emojis: [],
				});
			}
		})
		.then(() => knexConnection('Logs')
			.where({
				courseId: event.pathParameters.courseId,
				studentId,
				msgType: 0,	// emon messages
			})
			.select('lessonNumber')
			.sum('val')
			.groupBy('lessonNumber'))
		.then((result) => {
			result.forEach((x) => {
				toRet[x.lessonNumber].emons += x['sum(`val`)'];
			});
		})
		.then(() => knexConnection('Logs')
			.where({
				courseId: event.pathParameters.courseId,
				studentId,
				msgType: 1,	// emojis
			})
			.select('lessonNumber', 'val'))
		.then((result) => {
			if (result.length !== 0) {
				result.forEach((x) => {
					toRet[x.lessonNumber].emojis.push(numToEmoji(x.val));
				});
			}
		})
		.then(() => knexConnection('Logs')
			.where({
				courseId: event.pathParameters.courseId,
				studentId,
			})
			.select('lessonNumber', 'dtime'))
		.then((result) => {
			if (result.length !== 0) {
				result.forEach((x) => {
					// assume same date for every log with same lesson number
					let date = JSON.stringify(x.dtime).split('T')[0];
					date = date.substr(1, date.length);
					toRet[x.lessonNumber].date = date;
					// console.log(x.dtime);
				});
			}
		})
		.then(async () => {
			knexConnection.client.destroy();

			callback(null, {
				statusCode: 200,
				body: JSON.stringify(toRet),
			});
		})
		.catch((err) => {
			// Disconnect
			knexConnection.client.destroy();
			// eslint-disable-next-line no-console
			console.log(`ERROR getting log: ${err}`);
			console.log(err);
			console.log(JSON.stringify(err));
			return callback(createError.InternalServerError('Error getting log.'));
		});
};

// GET log/condensed/{studentId}/byCourse/{courseId}
const getCondensedLogCsv = async (event, context, callback) => {
	if (!event.pathParameters.courseId || !event.pathParameters.studentId) {
		return callback(createError.BadRequest("Student's and course's IDs required."));
	}
	if (!isAnInteger(event.pathParameters.courseId)) {
		return callback(createError.BadRequest('Course ID should be an integers.'));
	}

	const studentId = decodeURI(event.pathParameters.studentId);

	// Connect
	const knexConnection = knex(dbConfig);
	const toRet = [];

	return knexConnection('Logs')
		.max('lessonNumber')
		.where({
			courseId: event.pathParameters.courseId,
			studentId,
		})
		.then((result) => {
			for (let i = 0; i <= result[0]['max(`lessonNumber`)']; i += 1) {
				toRet.push({
					emons: 0,
					emojis: [],
				});
			}
		})
		.then(() => knexConnection('Logs')
			.where({
				courseId: event.pathParameters.courseId,
				studentId,
				msgType: 0,	// emon messages
			})
			.select('lessonNumber')
			.sum('val')
			.groupBy('lessonNumber'))
		.then((result) => {
			result.forEach((x) => {
				toRet[x.lessonNumber].emons += x['sum(`val`)'];
			});
		})
		.then(() => knexConnection('Logs')
			.where({
				courseId: event.pathParameters.courseId,
				studentId,
				msgType: 1,	// emojis
			})
			.select('lessonNumber', 'val'))
		.then((result) => {
			if (result.length !== 0) {
				result.forEach((x) => {
					toRet[x.lessonNumber].emojis.push(numToEmoji(x.val));
				});
			}
		})
		.then(async () => {
			knexConnection.client.destroy();

			let resArray = toRet;

			const csvHeader = Object.keys(resArray[0]).sort().join(',');

			resArray = resArray.map(x => Object.entries(x)
				// eslint-disable-next-line no-nested-ternary
				.sort((a, b) => ((a[0] < b[0]) ? -1 : (a[0] > b[0]) ? 1 : 0))
				.map(y => y[1]).join(',')).join('\r\n');

			callback(null, {
				statusCode: 200,
				headers: {
					'Content-Disposition': ' attachment; filename="log.csv"',
					'Content-Type': 'text/csv; charset=UTF-8',
				},
				body: `${csvHeader}\n${resArray}`,
			});
		})
		.catch((err) => {
			// Disconnect
			knexConnection.client.destroy();
			// eslint-disable-next-line no-console
			console.log(`ERROR getting log: ${err}`);
			console.log(err);
			console.log(JSON.stringify(err));
			return callback(createError.InternalServerError('Error getting log.'));
		});
};

const handler = middy(getCondensedLog)
	.use(httpEventNormalizer())
	.use(httpErrorHandler())
	.use(cors(corsConfig));

const csv = middy(getCondensedLogCsv)
	.use(httpEventNormalizer())
	.use(httpErrorHandler())
	.use(cors(corsConfig));

module.exports = { handler, csv };
