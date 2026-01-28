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
const nodemailer = require("nodemailer");
require('dotenv').config();


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    auth: {
    user: process.env.USER_NAME, // Ensure the email is correctly formatted
    pass: process.env.PASSWORD, // Use your actual app-specific password here
},
    debug: true,
    port: 587, // Use 587 for TLS
    secure: false, // Set to false for TLS
});

transporter.verify((error, success) => {
    if (error) {
      console.error("SMTP Error:", error); // Log detailed SMTP error
    } else {
        console.log("SMTP Connection successful:", success);
    }
});


// create a course by faculty
router.post('/createcourse/:email', async (req, res) => {

    const u = await user.findOne({email : req.params.email})
    const f = await faculty.findOne({ userId : u._id});
    const savedCourse = await course.create({
        courseCode : req.body.coursecode,
        courseName : req.body.coursename,
        departmentName : req.body.department,
        ltpsc : req.body.ltpsc,
        prerequisites : req.body.prerequisites,
        status : 'notapproved',
        facultyId : f._id
    });
    res.json({ message: 'Course added successfully'});
});




// offer the course by faculty
router.post('/offercourse/:email' , async(req,res) =>{

    const u = await user.findOne({email : req.params.email})
    const f = await faculty.findOne({ userId : u._id});
    const s = await session.findOne({academicYear : Number(req.body.academicyear) , phase : req.body.phase })
    const offering = await Offering.create({
        facultyId : f._id,
        courseCode : req.body.coursecode,
        sessionId : s._id,
        status : 'pendingAdminApproval',
        eligibleBatches : req.body.batch,
        maxSeats : 120
    })
    res.json({ message: 'Course offered successfully'});
})




// fetch all the courses that have been available for offerings
router.get('/availablecourse/:email', async(req,res) => {

    const courses = await course.find({status : 'approved'}).populate('departmentName');
    res.status(200).json(courses);
})




// fetch the courses that have been offered by the faculty but needs approval from the admin
router.get('/courseneedadminapproval/:email', async (req,res) =>{

    const u = await user.findOne({email : req.params.email})
    const f = await faculty.findOne({ userId : u._id});

    const offerings = await Offering.find({status : 'pendingAdminApproval' , facultyId : f._id })
    .populate('sessionId');
    res.status(200).json(offerings);
})




// fetch all the students that must be given acceptance or rejection
router.get('/studentneedapproval/:email', async (req,res) =>{

    const u = await user.findOne({email : req.params.email})
    const f = await faculty.findOne({ userId : u._id});


    const enrollment = await Enrollment.find({ status: 'pendingInstructorApproval', facultyId : f._id })
    .populate('studentId')
    .populate({
        path: 'studentId',
        populate: [
            { path: 'userId' },
            { path: 'department', model: 'Department' } // <-- populate department
        ],
    })
    .populate('offeringId')
    .populate({
        path: 'offeringId',
        populate: { path: 'sessionId' },
    });

    res.status(200).json(enrollment);
})




// fetch all the courses you created and needs approval from admin
router.get('/createdcourseneedapproval/:email', async (req,res) =>{

    const u = await user.findOne({email : req.params.email})
    const f = await faculty.findOne({ userId : u._id});

    
    const courses = await course.find({status : 'notapproved' , facultyId : f._id }).populate('departmentName');
    res.status(200).json(courses);
})




// fetch the courses that have been approved by the admin
router.get('/offeredcourses/:email' , async (req,res) =>{

    const u = await user.findOne({email : req.params.email})
    const f = await faculty.findOne({ userId : u._id});

    const d = await department.findOne( { departmentName : f.department } )

    const offerings = await Offering.find({ facultyId : f._id })
    .populate('sessionId')
    res.status(200).json(offerings);
})




// fetch all the courses created by the faculty 
// faculty.js
router.get('/createdcourses/:email' , async (req,res) => {
    try {
        const u = await user.findOne({email : req.params.email});
        const f = await faculty.findOne({ userId : u._id });

        // Populate the departmentName field
        const courses = await course.find({facultyId : f._id})
                                    .populate('departmentName'); 
        // 'departmentName' is the field in Course schema
        // second 'departmentName' is the field you want from Department

        res.status(200).json(courses);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});




router.post('/changecoursestatus/:email', async (req, res) => {
    try {
        const { ids, action } = req.body;
        if (!ids || !action) {
            return res.status(400).json({ error: 'Invalid request data' });
        }

        await Enrollment.updateMany(
            { _id: { $in: ids } },
            { $set: { status: action === 'Approve' ? 'pendingAdvisorApproval' : 'rejected' } }
        );

        const updatedEnrollments = await Enrollment.find({ _id: { $in: ids } })
            .populate('studentId') // Populate student details
            .populate('offeringId') // Populate course/offering details if needed
            .populate({
                path: 'studentId',
                populate: { path: 'userId' },
            })

        for (const enrollment of updatedEnrollments) {
            const student = enrollment.studentId;
            if (student && student.userId && student.userId.email) {
                // Construct the email
                const mailOptions = {
                    from: process.env.USER_NAME, // Sender's email address
                    to: student.userId.email, // Student's email address
                    subject: `Your Enrollment Status Has Been Updated`,
                    text: `Dear ${student.userId.name},\n\nYour enrollment status for the course ${
                        enrollment.offeringId?.courseCode || 'N/A'
                    } has been updated to "${action === 'Approve' ? 'PendingAdvisorApproval' : 'Rejected'}".\n\nBest regards,\nAdmin Team`,
                };

                // Send the email
                try {
                    await transporter.sendMail(mailOptions);
                    console.log(`Email sent to ${student.userId.email}`);
                } catch (err) {
                    console.error(`Failed to send email to ${student.userId.email}:`, err);
                }
            } else {
                console.warn(`Email not sent: Missing email for student ${student?._id}`);
            }
        }

        res.status(200).json({ message: `Status updated to ${action}` });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});




// router.get('/enrolledstudents/:id', async (req,res) =>{
//     const enrollment = await Enrollment.find({ status: 'pendingInstructorApproval', facultyId : f._id })
//     .populate('studentId')
//     .populate({
//         path: 'studentId',
//         populate: [
//             { path: 'userId' },
//             { path: 'department', model: 'Department' } // <-- populate department
//         ],
//     })
//     .populate('offeringId')
//     .populate({
//         path: 'offeringId',
//         populate: { path: 'sessionId' },
//     });

//     res.status(200).json(enrollment);
// })

router.get('/enrolledstudents/:id', async (req, res) => {
  try {
    const offeringId = req.params.id;


    const enrollments = await Enrollment.find({
      offeringId: offeringId,
      status: 'running' // or remove this if you want ALL enrolled students
    })
      .populate({
        path: 'studentId',
        populate: [
          { path: 'userId' },
          { path: 'department', model: 'Department' }
        ]
      })
      .populate({
        path: 'offeringId',
        populate: { path: 'sessionId' }
      });


    res.status(200).json(enrollments);
  } catch (err) {
    console.error('🔥 Error fetching enrolled students:', err);
    res.status(500).json([]);
  }
});




router.get('/studentneedadvisorapproval/:email', async (req, res) => {
  try {

    const u = await user.findOne({ email: req.params.email });
    if (!u) return res.status(200).json([]);

    const f = await faculty.findOne({ userId: u._id });
    if (!f) return res.status(200).json([]);

    // ✅ FIND ALL DEPARTMENTS ADVISED BY THIS FACULTY
    const advisedDepartments = await department.find({
      facultyAdvisor: f._id
    });

    if (!advisedDepartments.length) {
      console.log('Faculty advises no departments');
      return res.status(200).json([]);
    }

    const advisedDeptIds = advisedDepartments.map(d => d._id.toString());

    
    // ✅ FETCH PENDING ADVISOR APPROVAL ENROLLMENTS
    const enrollments = await Enrollment.find({
      status: 'pendingAdvisorApproval'
    })
      .populate({
        path: 'studentId',
        populate: [
          { path: 'userId' },
          { path: 'department', model: 'Department' }
        ]
      })
      .populate({
        path: 'offeringId',
        populate: { path: 'sessionId' }
      });


    // ✅ FILTER: student belongs to ANY advised department
    const filtered = enrollments.filter(e => {
      const studentDeptId = e.studentId?.department?._id?.toString();
      const match = advisedDeptIds.includes(studentDeptId);

      return match;
    });


    res.status(200).json(filtered);
  } catch (err) {
    console.error(' Advisor approval error:', err);
    res.status(500).json([]);
  }
});


router.post('/changecoursestatusadvisor/:email', async (req, res) => {
    try {
        const { ids, action } = req.body;
        if (!ids || !action) {
            return res.status(400).json({ error: 'Invalid request data' });
        }
        await Enrollment.updateMany(
            { _id: { $in: ids } },
            { $set: { status: action === 'Approve' ? 'running' : 'rejected' } }
        );

        const updatedEnrollments = await Enrollment.find({ _id: { $in: ids } })
            .populate('studentId') // Populate student details
            .populate('offeringId') // Populate course/offering details if needed
            .populate({
                path: 'studentId',
                populate: { path: 'userId' },
            })

        for (const enrollment of updatedEnrollments) {
            const student = enrollment.studentId;
            if (student && student.userId && student.userId.email) {
                // Construct the email
                const mailOptions = {
                    from: process.env.USER_NAME, // Sender's email address
                    to: student.userId.email, // Student's email address
                    subject: `Your Enrollment Status Has Been Updated`,
                    text: `Dear ${student.userId.name},\n\nYour enrollment status for the course ${
                        enrollment.offeringId?.courseCode || 'N/A'
                    } has been updated to "${action === 'Approve' ? 'Running' : 'Rejected'}".\n\nBest regards,\nAdmin Team`,
                };

                // Send the email
                try {
                    await transporter.sendMail(mailOptions);
                    console.log(`Email sent to ${student.userId.email}`);
                } catch (err) {
                    console.error(`Failed to send email to ${student.userId.email}:`, err);
                }
            } else {
                console.warn(`Email not sent: Missing email for student ${student?._id}`);
            }
        }

        res.status(200).json({ message: `Status updated to ${action}` });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});




router.get('/facultyadvisor/:email', async (req, res) => {
  try {
    const u = await user.findOne({ email: req.params.email });
    if (!u) return res.status(404).json(false);

    const f = await faculty.findOne({ userId: u._id });
    if (!f) return res.status(404).json(false);

    // 🔑 Check department where THIS faculty is advisor
    const d = await department.findOne({ facultyAdvisor: f._id });

    res.status(200).json(!!d); // true if found, false otherwise
  } catch (err) {
    console.error(err);
    res.status(500).json(false);
  }
});





router.post('/allofferedcourses/:email' , async (req,res) => {

    const s = await session.findOne({academicYear : Number(req.body.academicyear) , phase : req.body.phase })
    const offerings = await Offering.find({ sessionId : s._id })
    .populate('sessionId')
    .populate('facultyId')
    .populate({
        path: 'facultyId',
        populate: { path: 'userId' },
    })
    
    res.status(200).json(offerings)
});


module.exports = router;
