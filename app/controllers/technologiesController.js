const Technology = require('../models/technology.js');



const technoController = {

    // GET all technologies

    getAllTechnologies: async (_req, res) => {
        try {
            const technologies = await Technology.find();
            if (!technologies) {
                return res.status(404).json({ error: 'Technologies not found' });
            }
            res.status(200).json(technologies);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to get technologies' });
        }
    }
}

module.exports = technoController;