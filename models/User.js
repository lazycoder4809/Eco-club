const mongoose = require('mongoose');
const { isEmail } = require('validator'); 
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate:[isEmail,'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        unique: true
    }
});

userSchema.pre('save', async function () {
    const data = this
    console.log(data);
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if(user){
        const auth12 = await bcrypt.compare(password, user.password)
        if(auth12){
            return user
        }
        throw Error('Incorrect password')
    }
    throw Error('Incorrect email')
}
    
    

const User = mongoose.model('user', userSchema);


module.exports =  User;
