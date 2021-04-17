const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
let cachedDB = null;

const connectToDB = async (uri) => {
	if (cachedDB) return cachedDB;
	const client = await MongoClient.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
	cachedDB = client.db(DB_NAME);
	return cachedDB;
};

const queryDB = async (db) => {
	const data = await db.collection('data').find({}).toArray();
	return {
		statusCode: 200,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*'
		},
		body: JSON.stringify(data)
	};
};

const pushToDB = async (db, data) => {
	const pushData = {
		title: data.title,
		body: data.body
	};

	if (pushData.title && pushData.body) {
		await db.collection('data').insert([data]);
		return {
			statusCode: 201,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			},
			body: JSON.stringify(data)
		};
	} else {
		return {
			statusCode: 422,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		};
	}
};

const deleteFromDB = async function (db, event) {
	const queryString = event.queryStringParameters;
	await db.collection('data').deleteOne({ _id: ObjectId(queryString.id) });
	return {
		statusCode: 200,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*'
		},
		body: JSON.stringify(queryString)
	};
};

exports.handler = async function (event, context) {
	context.callbackWaitsForEmptyEventLoop = false;
	const db = await connectToDB(MONGODB_URI);
	switch (event.httpMethod) {
		case 'GET':
			return queryDB(db);
		case 'POST':
			return pushToDB(db, JSON.parse(event.body));
		case 'DELETE':
			return deleteFromDB(db, event);
		case 'OPTIONS':
			return {
				statusCode: 200,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers':
						'Origin, X-Requested-With, Content-Type, Accept',
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
				},
				body: 'This was a preflight call'
			};
		default:
			return { statusCode: 400 };
	}
};
