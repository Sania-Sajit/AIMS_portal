const mongoose = require('mongoose');


const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    }
});


const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
