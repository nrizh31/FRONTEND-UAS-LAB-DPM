const mongoose = require('mongoose');

const exploreSchema = new mongoose.Schema(
    {
        photo: {
            type: String,
            required: [true, 'Please add a photo URL'],
        },
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Explore', exploreSchema);