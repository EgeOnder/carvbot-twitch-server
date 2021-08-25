const { Schema } = require('mongoose');

const specialCommandSchema = new Schema({
	name: { type: String, required: true },
	display_name: { type: String, required: true },
	response: { type: String, required: true },
	description: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
});

module.exports = {
	specialCommandSchema: specialCommandSchema,
};
