const express = require('express');
const router = express.Router();
const {
    createPhoto,
    getPhotos,
    updatePhoto,
    deletePhoto,
} = require('../controller/ExploreController');
const { protect } = require('../middleware/AuthMiddleware');

router.route('/').get(getPhotos).post(protect, createPhoto);
router.route('/:id').put(protect, updatePhoto).delete(protect, deletePhoto);

module.exports = router;