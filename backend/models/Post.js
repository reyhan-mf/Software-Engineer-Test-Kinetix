//  Field: title (string, required), content (string, required)
//  Field: category (string, default: 'General')
//  Field: author — bukan string biasa, tapi referensi ke User (ini konsep baru: ObjectId & ref)
//  Field: coverImage (string, opsional — untuk gambar thumbnail)
//  Ada timestamps

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true,
    },
    content:{
        type:String,
        required:true
    },
    category:{
        type: String,
        default: 'General',
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    coverImage:{
        type:String
    }
},
{timestamps:true}
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
