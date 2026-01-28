const mongoose = require('mongoose');


const sessionSchema = new mongoose.Schema({

    academicYear: {
        type: Number,
        required: true
    },
    phase: {
        type: String,
        required: true,
        enum: ['I', 'II'],
    }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
