const { Router } = require('express');
const TwitchStrategy = require('passport-twitch.js').Strategy;
const passport = require('passport');
const mongoose = require('mongoose');

require('dotenv').config();
const router = Router();
const { userSchema } = require('../models/User');
const { isAuth } = require('../functions/isAuthorized');

const User = mongoose.model('User', userSchema);

const twitch = new TwitchStrategy(
	{
		clientID: process.env.TWITCH_CLIENT_ID,
		clientSecret: process.env.TWITCH_SECRET,
		callbackURL: process.env.TWITCH_CALLBACK,
		scope: [
			'moderation:read',
			'user:read:email',
			'user:edit',
			'channel:read:polls',
			'channel:read:predictions',
			'channel:manage:polls',
			'channel:manage:predictions',
			'channel:edit:commercial',
			'bits:read',
		],
	},
	async (accessToken, refreshToken, profile, done) => {
		try {
			const user = await User.findOne({ twitchId: profile.id });
			if (user) {
				const updatedUser = await User.findOneAndUpdate(
					{
						twitchId: profile.id,
					},
					{
						username: profile.display_name,
						access_token: accessToken,
					},
					(err) => {
						if (err) console.error(err);
					}
				);

				const savedUser = await updatedUser.save();
				return done(null, savedUser);
			} else {
				const newUser = await User.create({
					twitchId: profile.id,
					username: profile.display_name,
					email: profile.email,
					login: profile.login,
					profile_picture: profile.profile_image_url,
					access_token: accessToken,
					createdAt: Date.now(),
				});

				const savedUser = await newUser.save();
				return done(null, savedUser);
			}
		} catch (error) {
			console.error(error);
			return done(null, null);
		}
	}
);

passport.use(twitch);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	const user = await User.findById(id);
	if (user) done(null, user);
});

router.get('/twitch', passport.authenticate('twitch.js'));
router.get(
	'/twitch/callback',
	passport.authenticate('twitch.js', {
		failureRedirect: 'http://localhost:3000/failure',
	}),
	(req, res) => {
		req.session.user = req.user;
		res.redirect('http://localhost:3000/dashboard');
	}
);

router.get('/twitch/logout', isAuth, (req, res) => {
	res.clearCookie('twitch.oauth2');
	res.redirect('http://localhost:3000/');
});

module.exports = router;
