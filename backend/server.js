const express = require('express')
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const facultyRoutes = require('./routes/faculty');
const adminRoutes = require('./routes/admin.js')
const studentRoutes = require('./routes/student.js')
const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();



// Access the PORT variable
const PORT = process.env.PORT;
const URI = process.env.URI;
app.use('/faculty', facultyRoutes);
app.use('/admin',adminRoutes)
app.use('/student',studentRoutes)
app.listen(PORT)


mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => console.log("Connected to MongoDB Atlas"))
   .catch((error) => console.error("MongoDB connection error:", error));

