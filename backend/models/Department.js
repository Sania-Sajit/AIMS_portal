const mongoose = require('mongoose');


const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
    },
    facultyAdvisor :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
    }
});


const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
