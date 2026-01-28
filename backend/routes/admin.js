const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.js');
const Session =require('../models/Session.js');
const Student = require('../models/Student.js');
const Faculty = require('../models/Faculty.js');
const Event = require('../models/Event.js');
const Department = require('../models/Department.js');
const Course = require('../models/Course.js');
const Offering= require('../models/Offering')

const AdminControls = require("../models/AdminControls");

require('dotenv').config();



const router = express.Router()

let otpStorage = {};
const bodyParser = require('body-parser');
const multer = require('multer');

const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');
const JWT_SECRET= secret;


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER_NAME,
    pass: process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Error:", error); // Log detailed SMTP error
  } else {
    console.log("SMTP Connection successful:", success);
  }
});


/* GET current status */
router.get("/controls", async (req, res) => {
  let controls = await AdminControls.findOne();
  if (!controls) {
    controls = await AdminControls.create({});
  }
  res.json(controls);
});

/* UPDATE controls */
router.put("/controls", async (req, res) => {
  const { allowEnrollment, allowDrop } = req.body;

  let controls = await AdminControls.findOne();
  if (!controls) controls = new AdminControls();

  if (allowEnrollment !== undefined)
    controls.allowEnrollment = allowEnrollment;

  if (allowDrop !== undefined)
    controls.allowDrop = allowDrop;

  await controls.save();
  res.json({ message: "Controls updated", controls });
});


// Endpoint to send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check if the email exists in the User collection
    const user = await User.findOne({ email }); // Replace 'User' with your Mongoose model name
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate OTP if email exists
    const otp = otpGenerator.generate(6, { digits: true, alphabets: false });
    console.log("Generated OTP:", otp);
    otpStorage[email] = [otp, user.role]; // Store the OTP and role in the temporary storage

    const mailOptions = {
      from: "san2345trial@gmail.com", // Your email
      to: email,
      subject: "Your OTP for Login",
      text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions); // Sending the email
    res.json({ message: "OTP sent successfully!", role: user.role }); // Include role in the response
  } catch (error) {
    console.error("Error sending OTP:", error); // Log the detailed error
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Endpoint to verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  console.log(otpStorage[email]);
  const role = otpStorage[email][1];
  if (otpStorage[email] && otpStorage[email][0] === otp) {
    delete otpStorage[email]; // Clear OTP after verification

    // Query the database to get the user's role
    const token = jwt.sign(
      { email, role }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: '1h' } // Token expiration
    ); 
    res.json({ message: "OTP verified successfully!", token, role, email });
     // Include role in the response
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const { academicYear, phase } = req.body;

    if (!academicYear || !phase) {
      return res.status(400).json({
        message: 'academicYear and phase are required'
      });
    }

    // 🔍 Check if session already exists
    const existingSession = await Session.findOne({
      academicYear,
      phase
    });

    if (existingSession) {
      return res.status(409).json({
        message: `Session ${academicYear} ${phase} already exists`
      });
    }

    // ✅ Create new session
    const newSession = new Session({ academicYear, phase });
    const savedSession = await newSession.save();

    res.status(201).json({
      message: 'Session created successfully!',
      session: savedSession
    });

  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      message: 'Server Error',
      error: error.message
    });
  }
});


// Get all sessions
router.get('/session-list', async (req, res) => {
  try {
    const sessions = await Session.find();
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Hash the password
    

    // Create a new user with the hashed password
    const newUser = new User({ name, email,role });

    // Save to the database
    const savedUser = await newUser.save();

    res.status(201).json({
      message: 'User created successfully!',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email must be unique' });
    } else {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
});
router.post('/students', upload.single('studentImage'), async (req, res) => {
    try {
      const { userId, studentId, enrollmentYear, program, department} = req.body;
  
      // Check for required fields
      if (!userId || !studentId || !enrollmentYear || !program || !department) {
        return res.status(400).json({ message: 'All fields are required!' });
      }
  
      // Check if studentId already exists
      const existingStudent = await Student.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({ message: `Student ID ${studentId} already exists! `});
      }
  
      // Create a new student
      const newStudent = new Student({
        userId,
        studentId,
        enrollmentYear,
        program,
        department
      });
  
      // If an image is uploaded, store it in the student record
      if (req.file) {
        newStudent.studentImage = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
      }
  
      // Save to the database
      const savedStudent = await newStudent.save();
  
      res.status(201).json({
        message: 'Student created successfully!',
        student: savedStudent,
      });
    } catch (error) {
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Duplicate key error. Ensure all unique fields are unique.' });
      }
  
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  });

router.post('/faculty', async (req, res) => {

    try {
      const { userId, department, designation, joiningYear} = req.body;
  
      const newFaculty = new Faculty({ userId, department, designation, joiningYear});
      const savedFaculty = await newFaculty.save();
  
      res.status(201).json({ message: 'Faculty created successfully!', faculty: savedFaculty });
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  });
  router.post('/events', async (req, res) => {
    try {
      const { eventName, sessionId, startDate, endDate } = req.body;
  
      const newEvent = new Event({ eventName, sessionId, startDate, endDate });
      const savedEvent = await newEvent.save();
  
      res.status(201).json({ message: 'Event created successfully!', event: savedEvent });
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  });
  router.post('/departments', async (req, res) => {
  const { departmentName, facultyAdvisor } = req.body;

  const department = new Department({
    departmentName,
    facultyAdvisor: facultyAdvisor || null
  });

  await department.save();
  res.status(201).json(department);
});
  router.post('/courses', async (req, res) => {
    try {
      const { courseId, courseName, offeringDepartment, credits, ltpsc, prerequisites } = req.body;
      console.log(req.body);
      const newCourse = new Course({ courseId, courseName, offeringDepartment, credits, ltpsc, prerequisites });
      const savedCourse = await newCourse.save();
  
      res.status(201).json({ message: 'Course created successfully!', course: savedCourse });
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  });
router.get('/session', async (req, res) => {
    try {
        const { academicYear, phase } = req.query;

        // Validate input
        if (!academicYear || !phase) {
            return res.status(400).json({ message: 'academicYear and phase are required' });
        }

        // Find the session in the database
        const session = await Session.findOne({ academicYear, phase });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Respond with the session _id
        res.status(200).json({ sessionId: session._id });
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
router.get('/events', async (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
  }

  try {
      // Find all events with the given sessionId
      const events = await Event.find({ sessionId: mongoose.Types.ObjectId(sessionId) });

      if (events.length === 0) {
          return res.status(404).json({ message: 'No events found for the given sessionId' });
      }

      res.status(200).json(events);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
  }
});

router.get('/departments', async (req, res) => {
  try {
      // Find all departments
      const departments = await Department.find()
      .populate({
        path: 'facultyAdvisor',
        populate: { path: 'userId' },
        options: { strictPopulate: false }
      });

      // Return the list of departments
      res.json(departments);
  } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/department/:id', async (req, res) => {
  const departmentId = req.params.id;
  
  try {
    const department = await Department.findById(departmentId);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json({ departmentName: department.departmentName });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// GET all courses (for Manage Course Advisors)
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('departmentName', 'departmentName')
      .populate({
        path: 'facultyId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// API to get Course ID and Name by Course _id
router.get('/course/:id', async (req, res) => {
  const courseId = req.params.id;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({
      courseId: course.courseId,
      courseName: course.courseName,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET /faculty
router.get("/faculty", async (req, res) => {
  try {
    const faculty = await Faculty.find()
      .populate("userId", "name email")
      .populate('department', 'departmentName'); // 🔥 THIS LINE

    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: "Error fetching faculty" });
  }
});

router.get('/students', async (req, res) => {
  try {
    const students = await Student.find()
    .populate('userId')
    .populate('department', 'departmentName');  // Populate user details
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Route to approve a course
router.put('/approve-courses/:courseId', async (req, res) => {
  const { courseId } = req.params;
  const { status } = req.body;

  try {
    // Validate status
    if (status !== 'approved') {
      return res.status(400).json({ message: "Invalid status. Only 'approved' is allowed." });
    }

    // Find and update the course
    const course = await Course.findByIdAndUpdate(
      courseId,
      { status },
      { new: true } // Return the updated document
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    res.status(200).json({ message: 'Course approved successfully.', course });
  } catch (error) {
    console.error('Error approving course:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
router.get('/offerings', async (req, res) => {
  try {
    const offerings = await Offering.find()
    .populate('sessionId')
    res.status(200).json(offerings);
  } catch (error) {
    console.error('Error fetching offerings:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Approve an offering
router.put('/approve-offerings/:offeringId', async (req, res) => {
  const { offeringId } = req.params;
  const { status } = req.body;

  try {
    // Validate status
    if (status !== 'approved') {
      return res.status(400).json({ message: "Invalid status. Only 'approved' is allowed." });
    }

    // Find and update the offering
    const offering = await Offering.findByIdAndUpdate(
      offeringId,
      { status },
      { new: true } // Return the updated document
    );

    if (!offering) {
      return res.status(404).json({ message: 'Offering not found.' });
    }

    res.status(200).json({ message: 'Offering approved successfully.', offering });
  } catch (error) {
    console.error('Error approving offering:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// POST API to check email in the users collection
router.post('/check-user', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate request
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if the email exists in the database
    const user = await User.findOne({ email });

    if (user) {
      // User exists
      return res.json({
        canLogin: true,
        role: user.role,
      });
    } else {
      // User does not exist
      return res.json({
        canLogin: false,
        role: null,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update Student
router.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, program, enrollmentYear, department } = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { studentId, program, enrollmentYear, department },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ 
      message: 'Student updated successfully!', 
      student: updatedStudent 
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Update Faculty
router.put('/faculty/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { designation, joiningYear, department } = req.body;

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      id,
      { designation, joiningYear, department },
      { new: true, runValidators: true }
    );

    if (!updatedFaculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.status(200).json({ 
      message: 'Faculty updated successfully!', 
      faculty: updatedFaculty 
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Delete Student
// Delete Student + User
router.delete("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find student first
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2️⃣ Delete linked user account
    if (student.userId) {
      await User.findByIdAndDelete(student.userId);
    }

    // 3️⃣ Delete student record
    await Student.findByIdAndDelete(id);

    res.status(200).json({
      message: "Student and user account deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// Delete Faculty
// Delete Faculty + User
router.delete("/faculty/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find faculty first
    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    // 2️⃣ Delete linked user account
    if (faculty.userId) {
      await User.findByIdAndDelete(faculty.userId);
    }

    // 3️⃣ Delete faculty record
    await Faculty.findByIdAndDelete(id);

    res.status(200).json({
      message: "Faculty and user account deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting faculty:", error);
    res.status(500).json({ message: "Server Error" });
  }
});



router.put('/departments/:id', async (req, res) => {
  const { departmentName, facultyAdvisor } = req.body;

  const updated = await Department.findByIdAndUpdate(
    req.params.id,
    {
      departmentName,
      facultyAdvisor: facultyAdvisor || null
    },
    { new: true }
  );

  res.json(updated);
});
// Delete Department
router.delete('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check references in parallel (faster)
    const [student, faculty, course] = await Promise.all([
      Student.findOne({ department: id }),
      Faculty.findOne({ department: id }),
      Course.findOne({ offeringDepartment: id })
    ]);

    if (student || faculty || course) {
      return res.status(400).json({
        message: 'Cannot delete department. Students, faculty, or courses are still assigned to it.'
      });
    }

    const deletedDepartment = await Department.findByIdAndDelete(id);

    if (!deletedDepartment) {
      return res.status(404).json({
        message: 'Department not found'
      });
    }

    res.status(200).json({
      message: 'Department deleted successfully!',
      department: deletedDepartment
    });

  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});


module.exports = router;