const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    //required: true,
  },
  studentId : {
    type : String,
    required : true,
    unique : true,
  },
  enrollmentYear: {
    type: Number,
  },
  program: {
    type: String,
    required : true,
  },
  department: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Department',
  required: true,
},

});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
