/**
 * Created by Administrator on 2017/3/15.
 */
//全局变量
var GLOBAL={
    goEasy:new GoEasy({
        appkey: '2f810cea-ef1c-42be-8e59-365d5b0a8fee'
    }),
    BATH:"../",
    isDrag:true,
    _cursor:"default",
    isHide:false
};

$(function () {
    _init_login._init();
    _init_chat._init();
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
            var _html="<img style='width:2em;height:2em;margin:-5px 0;' onclick='_init_chat._interface_head._init_show_interface();' src='"+data.img+"'/>";
            $("#userinfo").prepend(_html);
            _html="<img class='static-default-img' onclick='_init_chat._interface_head._init_setting_theme(this);' style='width:4em;height:4em;margin:0 .5em;border-radius: 4px;cursor: pointer;' src='"+data.img+"'/>";
            if(data.img!=""){
                $(".user-img>.default-user-img").after(_html);
            }else{
                $(".user-img>.default-user-img").text(data.username?(data.username).substr(0,1):(data.account).substr(0,1)).show();
            }
            $("#username,.username-contain>.username").text(data.username);
            $(".static-default-img").bind("click");
            _init_chat._interface_content._init_userlist();
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
        _init_chat._init_resizable();
        _init_chat._init_draggable();
        _init_chat._interface_head._init_setting_bgColor();
    },
    _init_resizable:function () {
        $("."+_init_chat._scopeId).resizable({
            containment:"body",
            handles: "n,e,s,w,ne,nw,se,sw",
            maxWidth:480,
            minWidth:240,
            minHeight:640,
            maxHeight:1040,
            classes:{
                "ui-resizable-se": "",
                "ui-resizable": "highlight"
            }
        });
    },
    _init_draggable:function () {
        $("."+_init_chat._scopeId).draggable({
            containment:"body",
            axis:"xy",
            stop:function (evt, hlp) {
                $(document).unbind("mousemove");
                var _contain={
                    width:$(this).width(),
                    height:$(this).height(),
                    left:hlp.offset.left,
                    top:hlp.offset.top
                };
                _init_chat._init_mousemove(_contain)
            }
        });
    },
    _init_mousemove:function (param) {
        $(document).mousemove(function(e){
            var _scope=$("."+_init_chat._scopeId);
            var _offset=_scope.offset();
            if(_scope.is(":hidden")){
                console.log(_offset.top);
                if(!GLOBAL.isHide&&e.pageY<20&&e.pageX>param.left&&e.pageX<param.left+param.width)
                    _scope.slideDown();
            }else{
                console.log(_offset.top);
                if(_offset.top<10&&(e.pageY>param.height+_offset.top||e.pageX<_offset.left||e.pageX>_offset.left+param.width))
                    _scope.slideUp();
            }
        });
    },
    /***********聊天界面头部**************/
    _interface_head:{
        _init_setting_bgColor:function () {             //颜色版
            $(".chat-interface-head .tool-skins").colorpicker({
                fillcolor:true,
                relElement:".chat-interface-contain",
                success:function(obj,color){
                    $(obj).css("color","#00A1CB");
                    $(".chat-interface-content-contain").css("background",color);
                }
            });
        },
        _init_setting_theme:function (_that) {               //背景图片
            var _html="<div class='skins-img'></div>";
            $(_html).dialog({
                width:800,
                height:600,
                title:"选择图片",
                closeText:"关闭",
                create:function () {
                    var _this=this;
                    for(var i=0;i<11;i++){
                        $(_this).append("<img style='width:9em;height:9em;margin:1px;' src='img/"+($(_that).hasClass("tool-img")?"theme":"img")+i+".jpg'/>");
                    }
                    $("img",_this).dblclick(function () {
                        var _src=$(this).attr("src");
                        if($(_that).hasClass("tool-img")){
                            $(".chat-interface-content-contain").css("background","url('"+_src+"')");
                        }else if($(_that).hasClass("default-user-img")){
                            $(_that).append("<img style='width:4em;height:4em;border-radius: 4px;cursor: pointer;' src='"+_src+"'/>");
                        }else{
                            $(_that).attr("src",_src);
                            $("#userinfo>img").attr("src",_src);
                        }
                    })
                }
            })
        },
        _init_close_interface:function () {
            location.href="../index.html";
        },
        _init_minimize_interface:function () {
            $("."+_init_chat._scopeId).slideUp();
            GLOBAL.isHide=true;
        },
        _init_show_interface:function () {
            $("."+_init_chat._scopeId).slideDown();
            GLOBAL.isHide=false;
        }
    },
    /***********聊天界面好友列表**********/
    _interface_content:{
        _init_userlist:function () {
            var _friends=_init_login._userInfo.friends;
            $("#chat-group>.group-user>.group").text(_friends.length+"/"+_friends.length)
        },
        _init_toggle_group:function (_this) {
            console.log($(_this).children("a").length);
            $(_this).children("a").toggleClass("fa-caret-right").toggleClass("fa-caret-down");
            if($(_this).hasClass("group-user")&&!$(_this).children("ul").length){
                var _friends=_init_login._userInfo.friends;
                console.log(_friends);
                $(_this).append("<ul></ul>");
                $.each(_friends,function (i, id) {
                    getUserById(GLOBAL.BATH,id,function (data) {
                        console.log(data);
                        var _li="<li>" +
                            "<img src='"+data.img+"' style='width:2em;height:2em;border-radius: 4px;margin:.2em;'/>" +
                            "<span>"+data.username+"</span>" +
                            "</li>";
                        $(_this).children("ul").append(_li);
                    });
                })
            }else{
                $(_this).children("ul").slideToggle();
            }
        }
    },
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