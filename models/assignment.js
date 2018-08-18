var mongoose = require('mongoose');

var AssignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    desc: {
        type: String,
        required: true,
        trim: true
    },
    created: {
        type: Date,
        required: true
    }
});

var Assignment = mongoose.model('Assignment', AssignmentSchema);
module.exports = Assignment;