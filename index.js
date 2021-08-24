const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');

require('dotenv').config();

const { connectToDb } = require('./functions/connectToDb');
const { isAuth } = require('./functions/isAuthorized');
const authRoute = require('./routes/auth');
const apiRoute = require('./routes/api');
const publicRoute = require('./routes/public');

connectToDb(process.env.MONGODB_STRING);

const app = express()
	.use(helmet())
	.use(morgan('tiny'))
	.use(cors())
	.use(express.json())
	.use(express.urlencoded({ extended: true }))
	.use(
		session({
			name: 'twitch.oauth2',
			key: process.env.SESSION_KEY,
			secret: process.env.SESSION_SECRET,
			saveUninitialized: true,
			resave: true,
			domain: process.env.DOMAIN_PLAIN,
		})
	)
	.use(passport.initialize())
	.use(passport.session())
	.use((req, res, next) => {
		res.set('Access-Control-Allow-Origin', process.env.DOMAIN);
		res.set('Access-Control-Allow-Credentials', true);
		res.set('X-Frame-Option', 'ALLOW FROM https://www.twitch.tv/');
		res.set(
			'Access-Control-Allow-Headers',
			'Origin, X-Requested-With, Content-Type, Accept'
		);
		next();
	});

app.get('/session', isAuth, (req, res) => {
	res.json(req.session.user);
});

/* ROUTES */
app.use('/auth', authRoute);
app.use('/api', apiRoute);
app.use('/public', publicRoute);

app.listen(process.env.PORT, () => {
	console.log(`App listening on ${process.env.PORT}`);
});
