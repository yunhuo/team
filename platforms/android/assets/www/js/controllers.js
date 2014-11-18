var CMD = {
	INFO: 'info',
	LOGIN: 'login',
	ME_GROUP: 'me:group',
	GROUP_STATUS: 'group:status',
	GROUP_UPDATE_NAME: 'group:update:name',
	GROUP_UPDATE_PROFILE: 'group:update:profile',
	GROUP_GET_ADMIN_LIST: 'group:get:admin:list',
	GROUP_UPDATE_ADMIN: 'group:update:admin',
	USER_UPDATE_PROFILE: 'user:update:profile',
	CHAT_CREATE: 'chat:create',
	ONLINE_UPDATE: 'online:update',
	ARTICLE_CREATE: 'article:create',
	ARTICLE_GET_LIST: 'article:get:list',
	ARTICLE_REMOVE: 'article:remove'
};

module.controller('AppController', function(socket, $rootScope, $scope){
	$scope.auth = {
		phone: '',
		password:''
	};
	$scope.online = 0;
	$scope.me = {};
	$scope.group = {
		profile:{
			name:'老来青吃货会'
		}
	};
	$scope.admins = [];
	$scope.articles = [];
	$scope.myTitle = '';
	$scope.chats = [];
	$scope.groupStatus = {};
	console.log('app');
	$scope.afterLoginPage = '';
	$scope.lastPage = '';
	$scope.currentPage = '';
	

	$scope.go = function(page){
		if(!page || page == ''){
			//menu.setMainPage('home.html', {closeMenu: true});
			return;
		}
		/*
		if(!$scope.me.id){
			$scope.afterLoginPage = page;
			menu.setMainPage('login.html', {closeMenu:true});
		}
		else
		*/
			menu.setMainPage(page + '.html', {closeMenu: true});
		$scope.lastPage = $scope.currentPage;
		$scope.currentPage = page;
	};

	$scope.go2 = function(page, arg){
		$scope._go_arg = arg;
		$scope.go(page);
	};

	$scope.goback = function(){
		$scope.go($scope.lastPage);
	};

	socket.on('connect', function(){
		console.log('connected.');
		if($scope.auth.phone)
			socket.emit(CMD.LOGIN, $scope.auth);
	});

	socket.on(CMD.INFO, function(ret){
		console.log(ret);
		$scope.msg = ret.msg;
		 modal.show();
		 setTimeout('modal.hide()', 1500);
	});
	socket.on(CMD.LOGIN, function(ret){
		$scope.me = ret;
		$scope.go($scope.afterLoginPage);
		console.log($scope.me);
		socket.emit(CMD.ME_GROUP, {});
	});
	socket.on(CMD.ME_GROUP, function(ret){
		console.log(ret);
		$scope.group = ret;
		$scope.go('home');
	});
	socket.on(CMD.GROUP_UPDATE_NAME, function(ret){
		$scope.group.name = ret;
		console.log(ret);
		$scope.go('group.settings');
	});
	socket.on(CMD.GROUP_UPDATE_PROFILE, function(ret){
		$scope.group.profile = ret;
		$scope.go('group.settings');
	});
	socket.on(CMD.GROUP_GET_ADMIN_LIST, function(ret){
		$scope.admins = ret;
		ret.map(function(e){
			if(e.user._id == $scope.me.id){
				$scope.myTitle = e.title;
			}
		});
		console.log(ret);
	});
	socket.on(CMD.GROUP_UPDATE_ADMIN, function(ret){
		$scope.admins.map(function(e){
			if(e.user._id == ret.user.id){
				e.title = ret.title;
			}
		});
		if(ret.user._id == $scope.me.id){
			$scope.myTitle = ret.title;
		}
		$scope.go('group.setttings.team');
		console.log(ret);
	});
	socket.on(CMD.USER_UPDATE_PROFILE, function(ret){
		$scope.me.profile = ret;
		$scope.go('account');
	});
	socket.on(CMD.CHAT_CREATE, function(ret){
		console.log(ret);
		$scope.chats.push(ret);
		if(navigator && navigator.notification)
			navigator.notification.beep(2);
		/*
		$("#chatData").focus();
     		$("<li></li>").html('<img src="'+ avatar +'"/><span>'+ret.profile.text+'</span>').appendTo("#chatMessages");
		*/
		if($('#chatData'))
			$("#chatData").focus();
		if($('#chat') && $('#chat')[0])
	  		$("#chat").animate({"scrollTop": $('#chat')[0].scrollHeight}, "slow");
      		//$('#chatAudio')[0].play();
	
	});
	socket.on(CMD.ONLINE_UPDATE, function(ret){
		console.log(ret);
		if(ret.mode == 1)
	  		$scope.online += 1;
	   	else
	    		$scope.online -= 1;      
	});
	socket.on(CMD.ARTICLE_GET_LIST,	function(ret){
		console.log(ret);
		$scope.articles = ret;
	});
	socket.on(CMD.ARTICLE_REMOVE, function(ret){
		console.log('aritcle:remove:'+ret);
		console.log($scope.articles.length);
		$scope.articles.map(function(e){
			if(e._id == ret){
				$scope.articles.splice(e, 1);
				console.log($scope.articles.length);
			}
		});
		$scope.go('article.list');
	});

	socket.on(CMD.GROUP_STATUS, function(ret){
		console.log(ret);
		$scope.groupStatus = ret.profile;
	});

})

.controller('LoginController', function(socket, $rootScope, $scope){
	$scope.doLogin = function(login){
		if(!login)
			return;
		console.log(login);
		$scope.auth.phone = login.phone;
		$scope.auth.password = login.password;
		login.screenId = 'screenId';
		socket.emit(CMD.LOGIN, login);
	};
})
.controller('GroupSettingsController', function(socket, $rootScope, $scope){
	$scope.doUpdateName = function(update){
		console.log(update);
		if(update && update.name){
			update.groupId = $scope.group._id;
			socket.emit(CMD.GROUP_UPDATE_NAME, update);
		}
	};
	
	$scope.doUpdateProfile = function(update){
		console.log(update);
		if(update){
			socket.emit(CMD.GROUP_UPDATE_PROFILE, {
				id: $scope.group._id,
				profile: update
			});
		}
	};

	$scope.doUpdateTeam = function(update){
		console.log(update.user);
		if(update){
			socket.emit(CMD.GROUP_UPDATE_ADMIN, {
				groupId: $scope.group._id,
				userId: update.user._id,
				title: update.title
			});
		}
	};

	$scope.update = $scope._go_arg;

	if($scope.admins.length == 0){
		console.log('get admin list');
		socket.emit(CMD.GROUP_GET_ADMIN_LIST, $scope.group._id);
	}
})

.controller('AccountController', function(socket, $scope){
	$scope.doAccountUpdate = function(update){
		console.log(update);
		if(update){
			socket.emit(CMD.USER_UPDATE_PROFILE, update);
		}
	};
})
.controller('OrdersController', function(socket, $scope){
	$scope.filter = function(v){
		console.log(v);
	};
})

.controller('ArticleController', function(socket, $scope){
	if($scope.articles.length == 0){
		socket.emit(CMD.ARTICLE_GET_LIST, $scope.group._id);
	}
	$scope.doPost = function(article){
		var content = (article.text)?article.text:$('.froala-element').html();
		if(content && article.title){
			console.log('send');
			socket.emit(CMD.ARTICLE_CREATE, {
				groupId: $scope.group._id,
				title: article.title,
				body: content,
				images: uploadImages
			});		
		}
	};

	$scope.update = $scope._go_arg;
	$scope.doRemove = function(update){
		console.log(update);
		if(update._id){
			socket.emit(CMD.ARTICLE_REMOVE, {
				groupId: $scope.group._id,
				articleId: update._id
			});
		}
	};
})

.controller('ChatController', function(socket, $scope){
	$scope.doSend = function(msg){
		if(!msg || !msg.text)
			return;

		socket.emit(CMD.CHAT_CREATE, {                                                                                    
			groupId: $scope.group._id,
		        text: msg.text
		});

		/*
		$("#chatData").focus();
     		$("<li></li>").html('<img src="small.jpg"/><span>'+msg.text+'</span>').appendTo("#chatMessages");
	  	$("#chat").animate({"scrollTop": $('#chat')[0].scrollHeight}, "slow");
      		$('#chatAudio')[0].play();
		*/
    		msg.text = '';
	};
})
