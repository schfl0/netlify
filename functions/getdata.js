const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
let cachedDb = null;

const connectToDatabase = async (uri) => {
	if (cachedDb) return cachedDb;
	const client = await MongoClient.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
	cachedDb = client.db(DB_NAME);
	return cachedDb;
};

const queryDatabase = async (db) => {
	const data = await db.collection('data').find({}).toArray();
	return {
		statusCode: 200,
		headers: {
			'Content-Type': 'application/json'
			//'Access-Control-Allow-Origin': '*',
			//'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type'
		},
		body: JSON.stringify(data)
	};
};

const pushToDatabase = async (db, data) => {
	const pushData = {
		title: data.title,
		body: data.body
	};

	if (pushData.title && pushData.body) {
		await db.collection('data').insert([data]);
		return {
			statusCode: 201
		};
	} else {
		return { statusCode: 422 };
	}
};

const deleteFromDatabase = async function (db, data) {
	const deleteData = {
		id: data._id
	};
	if (deleteData.id) {
		await db.collection('data').deleteOne({ _id: ObjectId(data._id) });
		return {
			statusCode: 201
		};
	} else {
		return { statusCode: 422 };
	}
};

exports.handler = async function (event, context) {
	context.callbackWaitsForEmptyEventLoop = false;
	const db = await connectToDatabase(MONGODB_URI);
	switch (event.httpMethod) {
		case 'GET':
			return queryDatabase(db);
		case 'POST':
			return pushToDatabase(db, JSON.parse(event.body));
		case 'DELETE':
			return deleteFromDatabase(db, JSON.parse(event.body));
		default:
			return { statusCode: 400 };
	}
};
