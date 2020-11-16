const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
	{
		userId: { type: String, required: true },
		score: { type: Number, required: true, default: 0 },
	},
);

module.exports = mongoose.model('User', UserSchema);