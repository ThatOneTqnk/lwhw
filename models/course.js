var mongoose = require('mongoose');

var CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        trim: true
    },
    name_lower: {
        type: String,
        required: true,
        trim: true
    }
});

var Course = mongoose.model('Course', CourseSchema);
module.exports = Course;