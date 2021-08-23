const { Schema } = require('mongoose');

const userSchema = new Schema({
	twitchId: { type: String, required: true },
	username: { type: String, required: true },
	email: String,
	login: { type: String, required: true },
	profile_picture: String,
	access_token: { type: String, reqired: true },
	createdAt: { type: Date, default: Date.now },
});

module.exports = {
	userSchema: userSchema,
};
