const { Router } = require('express');
const { model } = require('mongoose');
const axios = require('axios');

const { commandSchema } = require('../models/Command');
const { userSchema } = require('../models/User');
const { specialCommandSchema } = require('../models/SpecialCommand');

const User = model('User', userSchema);
const Command = model('Command', commandSchema);
const SpecialCommand = model('SpecialCommand', specialCommandSchema);

require('dotenv').config();

const router = Router();

router.get('/commands/special', async (req, res) => {
	const allCommands = await SpecialCommand.find({});

	return res.json(allCommands);
});

router.get('/commands/special/:name', async (req, res) => {
	const specialCommand = await SpecialCommand.findOne({
		name: req.params.name,
	});

	return res.json(specialCommand);
});

router.post('/commands/special', async (req, res) => {
	const { name, display_name, response, description } = req.body;

	const exists = await SpecialCommand.findOne({ name: name });

	if (exists)
		return res.json({ error: 'This special command already exists!' });
	else {
		const newSpecialCommand = await SpecialCommand.create({
			name: name,
			display_name: display_name,
			response: response,
			description: description,
			createdAt: Date.now(),
		});

		await newSpecialCommand.save();
		return res.json({
			message: 'Special command has been created!',
			special_command: newSpecialCommand,
		});
	}
});

router.get('/commands/:id', async (req, res) => {
	const userId = req.params.id;
	const commandBase = await Command.findOne({ twitchId: userId });

	if (commandBase) {
		res.json(commandBase);
	} else {
		res.json({
			message: 'No commands found!',
		});
	}
});

router.post('/commands/prefix/:token', async (req, res) => {
	const userToken = req.params.token;
	const { prefix } = req.body;

	const user = await User.findOne({ access_token: userToken });

	if (user) {
		if (prefix.length > 1)
			return res.json({ error: 'Prefix cannot be that long!' });
		else if (prefix.length < 1)
			return res.json({ error: 'Prefix cannot be that short!' });
		else {
			if (prefix == '/')
				return res.json({ error: 'Prefix cannot be "/"' });
			else {
				const commandBase = await Command.findOne({
					twitchId: user.twitchId,
				});

				if (commandBase) {
					const updatedPrefix = await Command.findOneAndUpdate(
						{ twitchId: user.twitchId },
						{ prefix: prefix },
						(err) => {
							if (err) return res.json({ error: err.message });
						}
					);

					await updatedPrefix.save();
					return res.json({
						message: `Prefix has successfully been changed to ${prefix}`,
						prefix: prefix,
					});
				} else
					return res.json({
						error: 'No commands found. Create a command first!',
					});
			}
		}
	} else return res.json({ error: 'User cannot be found!' });
});

router.post('/commands/:token', async (req, res) => {
	const userToken = req.params.token;
	const {
		prefix,
		command,
		commandName,
		commandDescription,
		commandResponse,
		specialCommand,
	} = req.body;

	const user = await User.findOne({ access_token: userToken });
	const commandBase = await Command.findOne({ twitchId: user.twitchId });

	if (user) {
		const specialCommandBase = await SpecialCommand.findOne({
			name: specialCommand,
		});

		const newCommandBase = {
			command: command,
			command_name: commandName,
			command_description: specialCommandBase
				? specialCommandBase.description
				: commandDescription,
			command_response: specialCommandBase
				? specialCommandBase.response
				: commandResponse,
			special_command: specialCommand,
			createdAt: Date.now(),
		};

		if (commandBase) {
			const nameExists = await Command.findOne({
				'commands.command_name': commandName,
			});
			const commandExists = await Command.findOne({
				'commands.command': command,
			});
			if (specialCommand) {
				const specialCommandExists = await Command.findOne({
					'commands.special_command': specialCommand,
				});

				if (specialCommandExists)
					return res.json({
						error: 'This special command has already been taken.',
					});
			}

			if (nameExists)
				return res.json({
					error: 'This command name already exists.',
				});
			if (commandExists)
				return res.json({ error: 'This command already exists.' });

			await commandBase.commands.push(newCommandBase);
			await commandBase.save();
		} else {
			const newCommand = await Command.create({
				twitchId: user.twitchId,
				prefix: prefix ? prefix : '!',
				commands: newCommandBase,
			});

			await newCommand.save();
		}

		return res.json({
			message: 'New command created!',
			command: newCommandBase,
		});
	} else return res.json({ error: 'User cannot be found!' });
});

router.delete('/commands/:token/:names', async (req, res) => {
	const userToken = req.params.token;
	const commands = req.params.names.split(',');

	const user = await User.findOne({ access_token: userToken });

	if (user) {
		const commandBase = await Command.findOne({ twitchId: user.twitchId });

		if (commandBase) {
			let deletedIds = [];

			commands.forEach((cmdName) => {
				commandBase.commands.forEach((cmd) => {
					if (cmd.command_name == cmdName) deletedIds.push(cmd._id);
				});
			});

			await deletedIds.forEach((id) => {
				commandBase.commands.pull(id);
			});

			await commandBase.save();

			return res.json({
				message: 'Command(s) has been successfully deleted!',
				deletedIds: deletedIds,
			});
		} else return res.json({ error: 'No commands found for this user!' });
	} else return res.json({ error: 'User cannot be found!' });
});

router.get('/mod/:id', async (req, res) => {
	const userId = req.params.id;
	const getModUri = `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${userId}`;

	const channel = await User.findOne({ twitchId: userId });

	try {
		axios
			.get(getModUri, {
				headers: {
					Authorization: `Bearer ${channel.access_token}`,
					'Client-Id': process.env.TWITCH_CLIENT_ID,
				},
			})
			.then((response) => res.json(response.data.data))
			.catch((error) => res.json({ error: error.message }));
	} catch (error) {
		res.json({ error: error.message });
	}
});

router.get('/streaminfo/:login/:access', async (req, res) => {
	const access = req.params.access;
	const userLogin = req.params.login;
	const getStreamUri = `https://api.twitch.tv/helix/streams?user_login=${userLogin}`;

	const channel = await User.findOne({ login: access });

	try {
		axios
			.get(getStreamUri, {
				headers: {
					Authorization: `Bearer ${channel.access_token}`,
					'Client-Id': process.env.TWITCH_CLIENT_ID,
				},
			})
			.then((response) => res.json(response.data))
			.catch((error) => res.json({ error: error.message }));
	} catch (error) {
		res.json({ error: error.message });
	}
});

router.get('/followers/:id', async (req, res) => {
	const userId = req.params.id;
	const getFollowerUri = `https://api.twitch.tv/helix/users/follows?to_id=${userId}`;

	const channel = await User.findOne({ twitchId: userId });

	try {
		axios
			.get(getFollowerUri, {
				headers: {
					Authorization: `Bearer ${channel.access_token}`,
					'Client-Id': process.env.TWITCH_CLIENT_ID,
				},
			})
			.then((response) => res.json(response.data))
			.catch((error) => res.json({ error: error.message }));
	} catch (error) {
		res.json({ error: error.message });
	}
});

router.get('/channel/:id', async (req, res) => {
	const userId = req.params.id;
	const getFollowerUri = `https://api.twitch.tv/helix/channels?broadcaster_id=${userId}`;

	const channel = await User.findOne({ twitchId: userId });

	try {
		axios
			.get(getFollowerUri, {
				headers: {
					Authorization: `Bearer ${channel.access_token}`,
					'Client-Id': process.env.TWITCH_CLIENT_ID,
				},
			})
			.then((response) => res.json(response.data))
			.catch((error) => res.json({ error: error.message }));
	} catch (error) {
		res.json({ error: error.message });
	}
});

module.exports = router;
