var app = angular.module('tweetApp', ['ngRoute','ngResource','ngFileUpload']).run(function($rootScope, $http){
	$rootScope.auth = false;
	$rootScope.cur_user = {username: '',password: ''};

	$rootScope.logout = function(){
		$http.get('/auth/logout');
		$rootScope.auth = false;
		$rootScope.cur_user = {username: '',password: ''};
	};
});

app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
	      templateUrl: 'timeline.html',
	      controller: 'mainController'
	    })
	    .when('/login', {
	      templateUrl: 'login.html',
	      controller: 'authController'
	    })
	    .when('/signup', {
	      templateUrl: 'register.html',
	      controller: 'authController'
	    });
});

app.factory('postService', function($resource){
  return $resource('/api/posts/:id',{id: '@id'}, 
  			{
				'update': {method:'PUT'}
			});
});

app.controller('mainController', function($scope,Upload , $rootScope, postService, $http){
	$scope.posts = postService.query();
	$scope.newPost = {message: '',imgPath: '',post_ip : '',created_by: {username: '',password: ''}, created_at: ''};
	$scope.filePath = "";
	$scope.data = {
	    model: "Time",
	    availableOptions: [
	      	{name: "Time", val: "created_at"},
			{name: "Like", val: "like"}
	    ]
   	};
  
	console.log($scope.data.model);

	$scope.upload = function (file) {
        Upload.upload({
            url: '/api/upload',
            data: {image: file}
        }).then(function (resp) {
        	var newPath = resp.data.replace('public/','');
            $scope.filePath = newPath;
        });
    };


	$scope.posting = function(){
		$scope.newPost.created_by = $rootScope.cur_user;
		$scope.newPost.created_at = Date.now();
		$scope.newPost.imgPath = $scope.filePath;
		console.log("fielepath "+$scope.newPost.imgPath);
		postService.save($scope.newPost, function(){
			$scope.posts = postService.query();
			$scope.newPost = {message: '',imgPath:'', created_by: '', created_at: ''};
			$scope.filePath = ""
		});
	};

	$scope.heart = function(post){
		if($rootScope.cur_user.username != ""){
			var index = $rootScope.cur_user.likePost.indexOf(post._id);
			if(index == -1)
				return {'background-position': 'left'};
			return {'background-position': 'right'};
			
		}
	};

	$scope.likeIp = function(post){
		$http.get('/api/likepost/'+post._id).success(function(data){
			var temp =''
			for(i in data){
				if(i != 0)
					temp += data[i].user.username+": "+data[i].likeIp + '\n';
			}
			window.alert(temp);
		});
	};

	$scope.like = function($post){
		postService.update({id:$post._id},$rootScope.cur_user,function(data){
			console.log(data);
			$rootScope.cur_user = data;	
		});
		var index = $rootScope.cur_user.likePost.indexOf($post._id);
		if(index == -1){
			$rootScope.cur_user.likePost.push($post._id);
			$post.like += 1;
		}else{
			if($post.like != 0){
				$rootScope.cur_user.likePost.splice(index,index+1);	
				$post.like -= 1;
			}
		}
	};
});


app.controller('authController', function($scope, $http, $rootScope, $location){
	$scope.user = {username: '', password: ''};
	$scope.error_message = '';

	$scope.login = function(){
		$http.post('/auth/login',$scope.user).success(function(data){
			if(data.state == 'success'){
				$rootScope.auth = true;
				$rootScope.cur_user = data.user;
				$location.path('/');
			}	else{
				$scope.error_message = data.message;
			}
		});
	};

	$scope.register = function(){
		$http.post('/auth/signup', $scope.user).success(function(data){
			if(data.state == 'success'){
				$rootScope.auth = true;
				$rootScope.cur_user = data.user;
				$location.path('/');
			}else{
				$scope.error_message = data.message;
			}
		});
	};

});


