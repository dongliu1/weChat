/**
 * Created by Administrator on 2017/3/15.
 */
//全局变量
var GLOBAL={
    goEasy:new GoEasy({
        appkey: '2f810cea-ef1c-42be-8e59-365d5b0a8fee'
    }),
    BATH:"../"
};

$(function () {
    _init_login._init();
    _init_chat._init_draggable();
});

/***********获取登录信息*************/
var _init_login={
    _userInfo:"",
    _init:function () {
        var _url = location.search; //获取url中"?"符后的字串
        if(_url.indexOf("userId")==-1){
            location.href="../index.html";
        }
        _url=_url.split("=");
        _init_login._init_userInfo(_url[1]);
    },
    _init_userInfo:function (userid) {
        getUserById(GLOBAL.BATH,userid,function (data) {
            _init_login._userInfo=data;
            var _html="<img style='width:2em;height:2em;margin:-5px 0;' src='"+data.img+"'/>";
            $("#userinfo").prepend(_html);
            _html="<img style='width:4em;height:4em;margin:0 .5em;border-radius: 4px;cursor: pointer;' src='"+data.img+"'/>";
            if(data.img!=""){
                $(".user-img>.default-user-img").after(_html);
            }else{
                $(".user-img>.default-user-img").text(data.username?(data.username).substr(0,1):(data.account).substr(0,1)).show();
            }
            $("#username,.username-contain>.username").text(data.username);
        })
    },
    _init_listen:function () {
        GLOBAL.goEasy.subscribe({
            channel: 'weChat',
            onMessage: function(message){
                //console.log(message);
                console.log('接收到消息:'+message.content);//拿到了信息之后，你可以做你任何想做的事
                var _show=(!isOwnMsg||(isOwnMsg&&message.content!=_message))?["left","right"]:["right","left"];
                var _img=(!isOwnMsg||(isOwnMsg&&message.content!=_message))?"img/img1.jpg":"img/img2.jpg";
                var _msg= '<div class="col-sm-10 text-'+_show[0]+'">'+
                    '<div class="message-contain user-message-'+_show[0]+'-contain">'+
                    '<div class="corner-'+_show[0]+'"></div>'+
                    '<div class="user-message text-left">'+message.content+'</div>'+
                    '</div>'+
                    '</div>';
                var _head='<div class="col-sm-2 text-'+_show[1]+'">'+
                    '<img src="'+_img+'" class="user-icon-'+_show[0]+'" style="width:2em;height:2em;margin:.5em 0;">'+
                    '</div>';
                var _html='<div class="row">';
                if(_show[0]=="left"){
                    _html+=(_head+_msg);
                }else{
                    _html+=(_msg+_head);
                }
                _html+='</div>';
                if(isOwnMsg)isOwnMsg=false;
                _message="";
                $(".message-list").append(_html);
                $("#message-text-content").val("");
            }
        });
    }
};

/*************聊天界面*************/
var _init_chat={
    _scopeId:"chat-interface-contain",            //聊天界面容器ID
    _init:function () {

    },
    _init_draggable:function () {
        $("."+_init_chat._scopeId).draggable({
            containment:"body",
            stop:function (evt, hlp) {
                if(hlp.offset.top<10){
                    $(this).slideUp();
                }
            }
        });
    },
    /***********聊天界面头部**************/
    _interface_head:{},
    /***********聊天界面好友列表**********/
    _interface_content:{},
    /***********聊天界面底部菜单**********/
    _interface_footer:{}
};

/*************聊天窗口*************/
var _init_chat_windows={
    _scopeId:"chat-window-contain",            //聊天窗口容器ID
    /***********聊天窗口左部好友列表**********/
    _window_left:{},
    /***********聊天窗口右部头部菜单**********/
    _window_right_top:{},
    /***********聊天窗口右部聊天内容**********/
    _window_right_content:{},
    /***********聊天窗口右部工具菜单**********/
    _window_right_toolbar:{},
    /***********聊天窗口右部底部内容**********/
    _window_right_footer:{}
};




var isOwnMsg=false;
var _message;

var goEasy = new GoEasy({
    appkey: '2f810cea-ef1c-42be-8e59-365d5b0a8fee'
});


function init_send() {
    _message=$("#message-text-content").val();
    isOwnMsg=true;
    if(_message==""){
        return false;
    }
    goEasy.publish ({
        channel: 'weChat',
        message: _message
    });
}