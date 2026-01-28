const express = require('express')
const mongoose = require('mongoose')
const app = express();

const enrollment = require('./models/Enrollment')
const student = require('./models/Student')
const user = require('./models/User')

require('dotenv').config();

const PORT = process.env.PORT;
const URI = process.env.URI;

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("Connected to MongoDB Atlas"))
.catch((error) => console.error("MongoDB connection error:", error));



app.get('/hit' , async (req, res) => {
    
    await enrollment.create({
        studentId: '6799066070a6ff2b9a6cf30c',
        facultyId: '6798d4cbe8b5ae12046e4f1e',
        departmentName : 'Computer Science and Engineering',
        enrollmentDate: new Date(),
        status: 'pendingInstructorApproval',
        offeringId: '6799095bb8aa1e9e1373db5e',
    })

    res.send("done")
})

app.listen(3000);