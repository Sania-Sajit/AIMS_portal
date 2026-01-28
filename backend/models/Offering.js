const mongoose = require('mongoose');
const course = require('./Course');

const offeringSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    //required : true,
  },
  courseCode :{
    type : String,
    required : true,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required : true,
  },
  status: {
    type: String,
    enum: ['pendingAdminApproval', 'approved', 'rejected'],
  },
  maxSeats: {
    type: Number,
  },
  eligibleBatches :[
    {
      type : Number,
      required : true,
    }
  ]
});

const Offering = mongoose.model('Offering', offeringSchema);
module.exports = Offering;
