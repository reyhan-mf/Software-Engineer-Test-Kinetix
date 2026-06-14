// TASK 1.1 — User Model
// Buat file backend/models/User.js

// Kriteria yang harus dipenuhi:

//  Field: name (string, required), email (string, required, unique), password (string, required)
//  Field opsional: avatar (string, untuk URL foto profil)
//  Password otomatis di-hash sebelum disimpan ke database
//  Ada method untuk membandingkan password (saat login)
//  Ada timestamps (createdAt, updatedAt)
// Konsep yang perlu dipelajari dulu:
// Mongoose Schema & Model
// pre('save') hook
// bcryptjs

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
    password:{
        type: String,
        required: true
    },
},
{timestamps:true}
);


userSchema.pre('save', async function(next) {
    
    if(!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);
    next();
})

userSchema.methods.comparePassword = async function(inputPassword){
    return bcrypt.compare(inputPassword, this.password);
}

const User = mongoose.model('User', userSchema);

module.exports = User;