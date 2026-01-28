const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  
  courseCode: {
    type: String,
    required : true,
  },
  courseName: {
    type: String,
    required : true,
  },
  departmentName: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Department',
  required: true
},
  ltpsc: {
    type : String,
    required : true,
  },
  prerequisites: [
    {
      type: String,
    },
  ],
  status: {
    type: String,
    enum: ['approved','notapproved'],
    required: true,
    default: 'notapproved',
  },
  facultyId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
  }
});

const course = mongoose.model('course', courseSchema);
module.exports = course;
