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
        _init_chat._interface_head._init_search_contact();
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
                "ui-resizable-se": ""
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
        },
        _init_search_contact:function () {
            var _scope=$("#search-contact");
            _scope.focus(function () {
                $(".chat-contact").removeClass("hidden").show();
                $(".chat-group .up-corner").css("left","8em");
                $(".chat-group a").removeClass("user-active");
                $(".chat-group a:last").addClass("user-active");
            }).blur(function () {
                var _val=$(this).val();
                if(_val==""){
                    $(".chat-contact").hide();
                    $(".chat-group .up-corner").css("left","1.2em");
                    $(".chat-group a").removeClass("user-active");
                    $(".chat-group a:first").addClass("user-active");
                    $(".chat-interface-content .chat-friends").removeClass("hidden").show();
                }
            }).on("keyup",function () {
                var _val=$(this).val();
                var _friends=_init_login._userInfo.friends;
                $("#contact-list").html("");
                $.each(_friends,function (f, fd) {
                    getUserById(GLOBAL.BATH,fd,function (data) {
                        if(_val&&(data.account.indexOf(_val)>-1||data.username.indexOf(_val)>-1)){
                            var _html="<li userId='"+fd+"' onclick='_init_chat._interface_content._init_open_window("+JSON.stringify(data)+")'>" +
                                "<img src='"+data.img+"' style='width:2em;height:2em;border-radius: 4px;margin:.2em;'/>" +
                                "<span>"+data.username+"</span>" +
                                "</li>";
                            $("#contact-list").append(_html);
                        }
                    })
                });
            })
        },
        _init_switch_tabs:function (distance,index) {
            $(".chat-group .up-corner").css("left",distance);
            $(".chat-group a").removeClass("user-active");
            $(".chat-group a:eq("+index+")").addClass("user-active");
            $(".chat-interface-content>div").addClass("hidden");
            $(".chat-interface-content>div:eq("+index+")").removeClass("hidden").show();
            if(index==1)_init_chat._interface_content._init_chat_groups()
        }
    },
    /***********聊天界面好友列表**********/
    _interface_content:{
        _init_userlist:function () {
            var _friends=_init_login._userInfo.friends;
            $("#chat-group>.group-user .group").text(_friends.length+"/"+_friends.length)
        },
        _init_toggle_group:function (_this) {
            $(_this).find(".list-corner").toggleClass("fa-caret-right").toggleClass("fa-caret-down");
            if($(_this).hasClass("group-user")&&!$(_this).children("ul").length){
                $(_this).find(".li-default-top").show();
                var _friends=_init_login._userInfo.friends;
                //console.log(_friends);
                $(_this).append("<ul style='display:none;height:100%;overflow-x:hidden;overflow-y:scroll;'></ul>");
                $.each(_friends,function (i, id) {
                    getUserById(GLOBAL.BATH,id,function (data) {
                        //console.log(data);
                        var _li="<li userId='"+id+"' onclick='event.stopPropagation();' ondblclick='_init_chat._interface_content._init_open_window("+JSON.stringify(data)+")'>" +
                            "<img src='"+data.img+"' style='width:2em;height:2em;border-radius: 4px;margin:.2em;'/>" +
                            "<span>"+data.username+"</span>" +
                            "</li>";
                        $(_this).children("ul").append(_li);
                        if(i==_friends.length-1){
                            $(_this).children("ul").slideDown();
                        }
                    });
                })
            }else{
                $(_this).children("ul").slideToggle(function () {
                    $(_this).find(".li-default-top").toggle();
                });
            }
        },
        _init_open_window:function (userinfo) {
            //console.log(userinfo,$(".chat-window-contain").length,$(".chat-window-contain").is(":hidden"));
            //var _src=$(".chat-interface-content-contain").css("background");
            if($(".chat-window-contain").is(":hidden"))$(".chat-window-contain").removeClass("hidden").show();
            $(".chat-window-contain").css("background",userinfo.background);

        },
        _init_chat_groups:function () {
            if(!$("#chat-groups-list").children("li").length){
                var _public=_init_login._userInfo.publicChanel;
                getPublicChanel(GLOBAL.BATH,function (chanels) {
                    var _html="";
                    $.each(_public,function (c, pid) {
                        _html+="<li onclick='_init_chat._interface_content._init_open_window("+JSON.stringify(chanels[pid])+")'><a href='javascript:void(0)' class='fa fa-comments' style='margin:0 .5em;color:#0a6aa1;'></a><span>"+chanels[pid].name+"</span></li>"
                    });
                    $("#chat-groups-list").append(_html);
                })
            }
        }
    },
    /***********聊天界面底部菜单**********/
    _interface_footer:{
        _init_menus:function () {
            $(".chat-interface-content-contain>.menu-list").toggle("drop")
        }
    }
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