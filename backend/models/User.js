// User model.
// - name (required), email (required, unique), password (hashed before save)
// - avatar (optional): URL of the profile picture
// - googleId (optional): set for accounts created via Google sign-in
// - timestamps (createdAt, updatedAt)
// The password is hashed in a pre('save') hook and compared via comparePassword.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique:true,
    },
    avatar:{
        type:String
    },
    // Optional: users who sign in with Google have no local password.
    password:{
        type: String,
    },
    // Google account id (the `sub` claim) for accounts created via Google login.
    googleId:{
        type: String,
    },
},
{timestamps:true}
);


userSchema.pre('save', async function() {
    if(!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

userSchema.methods.comparePassword = async function(inputPassword){
    // Google-only accounts have no password to compare against.
    if (!this.password) return false;
    return bcrypt.compare(inputPassword, this.password);
}

const User = mongoose.model('User', userSchema);

module.exports = User;