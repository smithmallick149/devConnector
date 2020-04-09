const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const config = require('config');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const brcypt = require('bcryptjs');

const User = require('../../models/User');

//@route GET api/auth
//@desc Test route
//@access Public
router.get('/', auth, async (req, res) => {
	try {
		const user = await await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (err) {
		console.log(err.message);
		return res.status(500).send('Server error');
	}
});

//@route POST api/auth
//@desc Authenticate user & get toekn
//@access Public
router.post(
	'/',
	[
		check('email', 'please include a valid email ').not().isEmpty(),
		check('password', 'password Required').exists(),
	],
	async (req, res) => {
		console.log(req.body);
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;
		try {
			// See if the user exists

			let user = await User.findOne({ email });

			if (!user) {
				res.status(400).json({ errors: [{ msg: ' Invalid credentials' }] });
			}
			//Return jsonwebtoken

			const isMatch = await brcypt.compare(password, user.password);
			if (!isMatch) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid Credentials' }] });
			}
			const payload = {
				user: {
					id: user.id,
				},
			};
			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 3600 },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			console.log(err.message);
			return res.status(500).send('Server error');
		}
	}
);

module.exports = router;
