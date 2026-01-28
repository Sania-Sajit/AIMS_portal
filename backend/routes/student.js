const express = require('express');
const router = express.Router();

const Enrollment = require('../models/Enrollment')
const Offering = require('../models/Offering')
const course = require('../models/Course')
const session = require('../models/Session')
const user = require('../models/User')
const student = require('../models/Student')
const faculty = require('../models/Faculty')
const department = require('../models/Department')
const AdminControls = require('../models/AdminControls');

async function getAdminControls() {
  let controls = await AdminControls.findOne();
  if (!controls) {
    controls = await AdminControls.create({
      allowEnrollment: true,
      allowDrop: true
    });
  }
  return controls;
}


router.get('/enrollmentspending/:email', async (req, res) => {
  try {

    const u = await user.findOne({ email: req.params.email })
    const s = await student.findOne({ userId: u._id })


    const enrollments = await Enrollment.find({
      status: { $in: ['pendingInstructorApproval', 'pendingAdvisorApproval'] },
      studentId: s._id
    })
      .populate({
        path: 'studentId',
        populate: [
          { path: 'userId' },               // Populate user details
          { path: 'department', model: 'Department' } // Populate department
        ]
      })
      .populate({
        path: 'offeringId', // Populate offering details
        populate: { path: 'sessionId' } // Optional: populate session if needed
      })

    res.status(200).json(enrollments);
  } catch (error) {
    console.error('Error fetching pending enrollments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/enrollmentsrunning/:email', async (req, res) => {
  try {
    const u = await user.findOne({ email: req.params.email });
    if (!u) return res.status(404).json({ message: 'User not found' });

    const s = await student.findOne({ userId: u._id });
    if (!s) return res.status(404).json({ message: 'Student not found' });

    const enrollments = await Enrollment.find({ status: 'running', studentId: s._id })
      .populate({
        path: 'studentId',
        populate: [
          { path: 'userId' },               // Populate user details
          { path: 'department', model: 'Department' } // Populate department
        ]
      })
      .populate({
        path: 'offeringId', // Populate offering details
        populate: { path: 'sessionId' } // Optional: populate session if needed
      })
      .exec();

    res.status(200).json(enrollments);
  } catch (error) {
    console.error('Error fetching running enrollments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/eligible-courses', async (req, res) => {
  try {
    const { email } = req.query;

    // Step 1: Find the User ID using email
    const User = await user.findOne({ email });
    if (!User) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 2: Find the Student details using userId
    const Student = await student.findOne({ userId: User._id });
    if (!Student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Step 3: Fetch all offerings where the student's enrollmentYear matches eligibleBatches
     const eligibleCourses = await Offering.find({
      eligibleBatches: { $in: [Student.enrollmentYear] },
      status: 'approved', // filters out pending admin approval
    });


    // Step 4: Return eligible courses
    res.status(200).json({ courses: eligibleCourses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.post('/create-enrollment', async (req, res) => {
  const { email, offeringId } = req.body;

  try {
    const controls = await getAdminControls();

    if (!controls.allowEnrollment) {
      return res.status(403).json({
        message: "Enrollment is disabled by admin"
      });
    }

    // Step 1: Find user by email
    const User = await user.findOne({ email });
    if (!User) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 2: Find student by userId
    const Student = await student.findOne({ userId: User._id });
    if (!Student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Step 3: Check if the student is already enrolled in the same course
    const existingEnrollment = await Enrollment.findOne({
      studentId: Student._id,
      offeringId: offeringId,
    });

    if (existingEnrollment) {
      // CASE 1: Re-add dropped course
      if (existingEnrollment.status === "dropped") {
        existingEnrollment.status = "pendingInstructorApproval";
        existingEnrollment.enrollmentDate = new Date();

        await existingEnrollment.save();

        return res.status(200).json({
          message: "Enrollment reactivated successfully",
          enrollment: existingEnrollment,
        });
      }
      return res.status(400).json({ message: 'Student is already enrolled in this course' });
    }

    // Step 4: Create enrollment
    const o = await Offering.findOne({ _id: offeringId })
    const newEnrollment = new Enrollment({
      studentId: Student._id,
      facultyId: o.facultyId,
      offeringId: offeringId, // Proper instantiation of ObjectId
      enrollmentDate: new Date(),
      status: 'pendingInstructorApproval',
      departmentName: Student.department, // Assuming department is in Student model
    });

    // Step 5: Save the enrollment
    const savedEnrollment = await newEnrollment.save();

    // Send response
    return res.status(201).json({
      message: 'Enrollment created successfully',
      enrollment: savedEnrollment,
    });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete("/drop-enrollment/:id", async (req, res) => {
  try {
    const controls = await getAdminControls();

    if (!controls.allowDrop) {
      return res.status(403).json({
        message: "Drop is disabled by admin"
      });
    }
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    enrollment.status = "dropped";
    await enrollment.save();

    res.status(200).json({ message: "Enrollment dropped successfully" });
  } catch (error) {
    console.error("Drop enrollment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;