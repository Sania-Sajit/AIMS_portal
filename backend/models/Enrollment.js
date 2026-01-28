const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
  },
  departmentName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  enrollmentDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['running', 'completed', 'dropped', 'pendingInstructorApproval', 'pendingAdvisorApproval' , 'rejected'],
    required: true,
  },
  offeringId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offering',
    required: true,
  },
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
