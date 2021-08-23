const { Schema } = require('mongoose');

const commandInfo = new Schema({
	command: { type: String, required: true },
	command_name: { type: String, required: true },
	command_description: String,
	command_response: String,
	special_command: String,
	createdAt: { type: Date, default: Date.now },
});

const commandSchema = new Schema({
	twitchId: { type: String, required: true },
	prefix: { type: String, required: true },
	commands: [
		{
			type: commandInfo,
			required: true,
		},
	],
});

module.exports = {
	commandSchema: commandSchema,
};
