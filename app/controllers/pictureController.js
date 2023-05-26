const Picture = require('../models/picture.js');

const postPicture = async (req, res) => {
    try {
        if(!req.file) {
            return res.status(400).json({ error: 'No picture found' });
        }

        const picture = new Picture({
            filename: req.file.filename,
            filepath: req.file.path,
        });
        await picture.save();
        res.status(201).json({ picture });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to post picture' });
    }
}

module.exports = { postPicture };