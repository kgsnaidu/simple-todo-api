const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const jwt = require('jsonwebtoken');
const _pick = require('lodash/pick');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 5,
        trim: true,
        unique: true,
        validate: {
            validator: isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    return _pick(userObject, ['_id', 'email']);
}

UserSchema.methods.generateAuthToken = function() {
    const user = this;
    const access = 'auth';
    const token = jwt.sign({ _id: user._id.toHexString(), access}, 'abc123').toString();

    user.tokens.push({ access, token});
    return user.save().then(() => token);
}

const User = mongoose.model('User', UserSchema);

module.exports = { User };