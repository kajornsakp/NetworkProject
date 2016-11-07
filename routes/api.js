var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Post = mongoose.model('Post');
var LikePost = mongoose.model('LikePost');
var multer  = require('multer')
var upload = multer({ dest: 'public/testupload/' })
function isAuthenticated(req, res, next){
	 if(req.method === "GET"){
        return next();
    }
    if (req.isAuthenticated()){
        return next();
    }
    return res.redirect('/#login');
};

router.use('/posts', isAuthenticated);

router.route('/upload')
	.post(upload.single('image'),function(req,res){
		console.log(req.file.path);
		return res.send(req.file.path)
	});

router.route('/likepost/:id')
	.get(function(req, res){
		LikePost.find({post:req.params.id}).populate('user').exec(function(err, likePosts){
			if(err)
				return res.send(err);
			return res.json(likePosts);
		});
	});

router.route('/posts')
	.post(function(req, res){
		var post = new Post();
		post.created_by = req.body.created_by;
		post.message = req.body.message;
		post.imgPath = req.body.imgPath;
		var ip = req.headers['x-real-ip'] || req.connection.remoteAddress
		var newip = ip.replace('::ffff:','');
		if(newip == "::1"){
			newip = "127.0.0.1";
		}
		post.post_ip = newip;
		console.log("post :" + newip);
		post.save(function(err, post){
			if(err)
				return res.send(500, err);
			console.log('not error');
			return res.json(post);
		});
	})
	.get(function(req, res){
		Post.find({}).populate('created_by').exec(function(err,posts){
			if(err)
				return res.send(500,err);
			return res.json(posts);
		});
	});

router.param('id', function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
  });
});

router.route('/posts/:id')
	.put(function(req, res){
		console.log('PUT request');

		User.find({username: req.body.username}, function(err, user){
			if(err)
				return res.send(err);

			var ip = req.headers['x-real-ip'] || req.connection.remoteAddress
			var newip = ip.replace('::ffff:','');
			if(newip == "::1"){
				newip = "127.0.0.1";
			}
			console.log('like ip : '+newip)
			var user1 = user[0];
			var checkLike = user[0].likePost.indexOf(req.post.id);
			if(checkLike >= 0){
				req.post.downLike(function(err, post){
					if(err)
						return res.send(err);
					console.log(post._id);
					User.update({username: req.body.username}, {$pullAll: {likePost: [post._id]}}, function(err, data, user){
						if(err)
							return res.send(err);
						LikePost.remove({user: user1._id, post: post._id}, function(err){
							if(err)
								return res.send(err);
						});
						return res.json(user);
					});
				});
			}else{
				req.post.upLike(function(err, post){
					if(err)
						return res.send(err);
					User.update({username: req.body.username}, {$push: {likePost: post._id}},function(err, data,user){
						if(err)
							return res.send(err);
						var likePost = new LikePost();
						likePost.user = user1;
						likePost.post = post;
						likePost.likeIp = newip;
						likePost.save(function(err, likePost){
							if(err)
								return res.send(err);
						});
						return res.json(user);
					});					
				});
			}	
		});
	
	})

	.post(function(req, res){
		console.log("post!");
		var comment = new Comment(req.body);
		comment.post = req.post;
		comment.save(function(err, comment){
			if(err)
				return res.send(err);
			req.post.comment.push(comment);
			req.post.save(function(err, post){
				if(err)
					return res.send(err);
				return res.json(post);
			});
		});
	})

	.get(function(req, res){
		return res.json(req.post);		
	})

	.delete(function(req, res){
		Post.remove({id:req.params.id}, function(err){
			if(err)
				return res.send(err);
			return res.json('delete post');
		});
	});

module.exports = router;
