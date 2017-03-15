/**
 * Created by liudong on 2017/3/15.
 */
/****获取所有用户**********
 *  @bath        相对路径
 *  @callback   回调函数
 * **********/
function getAllUsers(bath,callback) {
    $.getJSON(bath+"files/users",function (data) {
        if(callback)callback(data);
        return data;
    })
}

/*******获取用户信息********
 *  @bath        相对路径
 *  @userId      用户id
 *  @callback   回调函数
 * *******/
function getUserById(bath,userId,callback) {
    $.getJSON(bath+"files/user_"+userId,function (data) {
        if(callback)callback(data);
        return data;
    })
}

/*****获取公共频道信息******
 *  @bath        相对路径
 *  @callback   回调函数
 * *****/
function getPublicChanel(bath,callback) {
    $.getJSON(bath+"files/public_chanels",function (data) {
        if(callback)callback(data);
        return data;
    })
}

/******登录*************
 * @bath       相对路径
 * @username  用户名
 * @password  密码
 * @callback  回调函数
 * ***********/
function postLogin(bath,username,password,callback) {
    var isLogin=false;
    getAllUsers(bath,function (_users) {
        //console.log(_users,username,password);
        $.each(_users,function (i, idata) {
            if(idata.account==username&&idata.password==password){
                isLogin=idata;
                return false;
            }
        });
        if(callback)callback(isLogin);
    });
}
