const mongoose = require('mongoose');

const connectToDb = (connectionString) => {
	mongoose
		.connect(connectionString, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		})
		.then(() => {
			console.log('MongoDB connection established');
		})
		.catch((error) => {
			console.error(error);
		});
};

module.exports = {
	connectToDb: connectToDb,
};
