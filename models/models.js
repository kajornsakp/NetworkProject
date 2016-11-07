var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
    created_by: { type: mongoose.Schema.ObjectId, ref: 'User' },
    created_at: {type: Date, default: Date.now},
    message: String,
    imgPath: String,
    post_ip: String,
    comment: [{type: mongoose.Schema.ObjectId, ref: 'Comment'}],
    like: {type: Number, default: 0},
    likeBy: [String]
});

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	created_at: {type: Date, default: Date.now},
    likePost: [{type: mongoose.Schema.ObjectId, ref: 'Post'}]
});

var likePostSchema = new mongoose.Schema({
    post: {type: mongoose.Schema.ObjectId, ref: 'Post'},
    user: {type: mongoose.Schema.ObjectId, ref: 'User'},
    likeIp: String
});


postSchema.methods.upLike = function(cb){
	this.like += 1;
	this.save(cb);
};

postSchema.methods.downLike = function(cb){
    if(this.like != 0){
        this.like -= 1;
        this.save(cb);
    }
};

mongoose.model('User', userSchema);
mongoose.model('Post', postSchema);
mongoose.model('LikePost', likePostSchema);
