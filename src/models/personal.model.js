import mongoose from 'mongoose';

const personalSchema = new mongoose.Schema({}, { collection: 'personal_information', strict: false });

const PersonalInfo = mongoose.models.PersonalInfo || mongoose.model('PersonalInfo', personalSchema);

export default PersonalInfo;