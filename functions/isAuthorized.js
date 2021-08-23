// eslint-disable-next-line no-unused-vars
const express = require('express');

const isAuth = (req, res, next) => {
	if (req.session.user) next();
	else
		res.json({
			message: 'Unauthorized',
		});
};

module.exports = {
	isAuth: isAuth,
};
