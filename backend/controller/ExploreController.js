const Explore = require('../models/ExploreModels');

// @desc    Create new photo
// @route   POST /api/explore
// @access  Private
const createPhoto = async (req, res) => {
    try {
        const { photo, name, description } = req.body;

        if (!photo || !name || !description) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        const explore = await Explore.create({
            photo,
            name,
            description,
            user: req.user.id,
        });

        res.status(201).json(explore);
    } catch (error) {
        console.error('Error creating photo:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all photos
// @route   GET /api/explore
// @access  Public
const getPhotos = async (req, res) => {
    try {
        const photos = await Explore.find()
            .sort({ createdAt: -1 })
            .populate('user', 'username');
        res.json(photos);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update photo
// @route   PUT /api/explore/:id
// @access  Private
const updatePhoto = async (req, res) => {
    try {
        const photo = await Explore.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        // Make sure user owns photo
        if (photo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedPhoto = await Explore.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedPhoto);
    } catch (error) {
        console.error('Error updating photo:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete photo
// @route   DELETE /api/explore/:id
// @access  Private
const deletePhoto = async (req, res) => {
    try {
        const photo = await Explore.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        // Make sure user owns photo
        if (photo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await photo.deleteOne();
        res.json({ message: 'Photo removed' });
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createPhoto,
    getPhotos,
    updatePhoto,
    deletePhoto,
};