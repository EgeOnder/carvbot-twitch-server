const { Router } = require('express');
const path = require('path');

const router = Router();

router.get('/:file', (req, res) => {
	res.sendFile(path.join(__dirname, '../', `/public/${req.params.file}`));
});

router.get('/favicon/:file', (req, res) => {
	res.sendFile(
		path.join(__dirname, '../', `/public/favicon/${req.params.file}`)
	);
});

router.get('/img/:file', (req, res) => {
	res.sendFile(path.join(__dirname, '../', `/public/img/${req.params.file}`));
});

module.exports = router;
