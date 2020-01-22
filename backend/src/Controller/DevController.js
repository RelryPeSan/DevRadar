const axios = require('axios');
const Dev = require('../models/Dev');
const { findConnections, sendMessage } = require('../websocket');

module.exports = {
	async index(req, res) {
		const devs = await Dev.find();

		return res.json(devs);
	},

	async store(req, res) {
		const { github_username, techs, latitude, longitude } = req.body;

		let dev = await Dev.findOne({github_username});

		if(!dev){
			const resGit = await axios.get(`https://api.github.com/users/${github_username}`);

			const {name = login, avatar_url, bio} = resGit.data;

			const location = {
				type: 'Point',
				coordinates: [longitude, latitude],
			}

			dev = await Dev.create({
				github_username,
				name,
				avatar_url, 
				bio,
				techs,
				location
			});

			// Filtrar as conexões
			const sendSocketMessageTo = findConnections(
				{latitude, longitude},
				techs
			);

			sendMessage(sendSocketMessageTo, 'new-dev', dev);
		}

		return res.json(dev);
	}
}