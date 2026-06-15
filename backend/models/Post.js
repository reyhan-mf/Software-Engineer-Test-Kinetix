// Post model.
// - title (required), content (required)
// - category (default: 'General')
// - author: ObjectId reference to a User
// - coverImage (optional): URL of the thumbnail image
// - timestamps (createdAt, updatedAt)

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
