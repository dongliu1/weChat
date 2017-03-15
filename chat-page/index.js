/**
 * Created by Administrator on 2017/3/15.
 */
//全局变量
var GLOBAL={
    goEasy:new GoEasy({
        appkey: '2f810cea-ef1c-42be-8e59-365d5b0a8fee'
    }),
    BATH:"../",
    isDrag:true
};

$(function () {
    _init_login._init();
    //_init_chat._init_mousedown();
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
    _init_mousedown:function () {
        var _cursor;
        var _scope=$("."+_init_chat._scopeId);
        var _offset;
        var _height;
        var _width;
        $(".chat-interface-resize").on("mousedown",function () {
            _cursor=$(this).css("cursor");
            _offset={
                top:parseInt(_scope.css("top").split("px")[0]),
                right:parseInt(_scope.css("right").split("px")[0]),
                bottom:parseInt(_scope.css("bottom").split("px")[0]),
                left:parseInt(_scope.css("left").split("px")[0])
            };
            _height=_scope.height();
            _width=_scope.width();
            $(this).on("mousemove",function (e) {
                console.log("aaaaa",_cursor);
                switch (_cursor){
                    case "n-resize":
                        _scope.draggable( "option", "axis", "y" );
                        if($(this).hasClass("chat-top-line")){
                            _scope.css({
                                "height":(_height+_offset.top-e.pageY)+"px"
                            });
                        }else{
                            _scope.css({
                                "height":(e.pageY-_offset.top)+"px"
                            });
                        }
                        break;
                    case "e-resize":
                        console.log(_width,_offset.left,e.pageX);
                        _scope.draggable( "option", "axis", "x" );
                        if($(this).hasClass("chat-left-line")){
                            _scope.css({
                                "width":(_width+_offset.left-e.pageX)+"px"
                            });
                        }else{
                            _scope.css({
                                "width":(e.pageX-_offset.left)+"px"
                            });
                        }
                        break;
                    case "nw-resize":
                        _scope.draggable( "option", "axis", "xy" );
                        break;
                    case "ne-resize":
                        _scope.draggable( "option", "axis", "xy" );
                        break;
                    case "sw-resize":
                        _scope.draggable( "option", "axis", "xy" );
                        break;
                    case "se-resize":
                        _scope.draggable( "option", "axis", "xy" );
                        break;
                    default:
                        break;
                }
            })
        }).on("mouseup",function () {

        });
        /*var _cursor;
        var _offset;
        var _scope=$("."+_init_chat._scopeId);
        var _coffset;
        var _height;
        var _width;
        $(".chat-interface-resize").draggable({
            containment:"body",
            start:function (evt, hlp) {
                _cursor=$(this).css("cursor");
                _offset=_scope.offset();
                _coffset=hlp.offset;
                _height=_scope.height();
                _width=_scope.width();
            },
            drag:function (evt, hlp) {
                switch (_cursor){
                    case "n-resize":
                        var _cur_height=_scope.height();
                        hlp.offset.left=_coffset.left;
                        if(_cur_height<_scope.css("max-height").split("px")[0]&&_cur_height>_scope.css("min-height").split("px")[0]){
                            if(e.pageY-_offset.top>10){
                                _scope.height(e.pageY-_offset.top());
                            }else{
                                _scope.css("top",e.pageY);
                                _scope.height(_height+(_offset.top()-e.pageY));
                            }
                        }else{
                            if(e.pageY-_offset.top>10){
                                hlp.offset.top=_offset.top()+_scope.height();
                            }else{
                                hlp.offset.top=_scope.css("top");
                            }
                        }
                        break;
                    case "s-resize":
                        var _cur_width=_scope.width();
                        hlp.offset.top=_coffset.top;
                        if(_cur_width<_scope.css("max-width").split("px")[0]&&_cur_height>_scope.css("min-width").split("px")[0]){
                            if(e.pageX-_offset.left>10){
                                _scope.width(_width+(e.pageX-_offset.left()));
                            }else{
                                _scope.css("right",e.pageX);
                                _scope.width(_offset.left()-e.pageX);
                            }
                        }else{
                            if(e.pageX-_offset.left>10){
                                hlp.offset.left=_offset.left()+_scope.width();
                            }else{
                                hlp.offset.left=_scope.css("left");
                            }
                        }
                        break;
                    case "nw-resize":
                        break;
                    case "ne-resize":
                        break;
                    case "sw-resize":
                        break;
                    case "se-resize":
                        break;
                    default:
                        break;
                }
            }
        })*/
    },
    _init_draggable:function () {
        $("."+_init_chat._scopeId).draggable({
            containment:"body",
            start:function () {
                
            },
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
            if($.isArray(param)){
                var _gapx=e.pageX-_start_offset.left;
                var _gapy=e.pageY-_offset.top;
                $.each(param,function (p,pdata){
                    if(pdata=="width"){
                        _scope.width=0
                    }
                });
                return false;
            }
            if(_scope.is(":hidden")){
                if(e.pageY<40&&e.pageX>param.left&&e.pageX<param.left+param.width)
                    _scope.slideDown();
            }else{
                if(_offset.top<30&&(e.pageY>param.height+_offset.top||e.pageX<_offset.left||e.pageX>_offset.left+param.width))
                    _scope.slideUp();
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