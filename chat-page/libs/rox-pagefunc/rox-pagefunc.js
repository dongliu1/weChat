/**
 * Created by liudong on 2017/3/6.
 */
/**
 获取分页信息：$(selector).skpages('setPages',{total:5000,currentPage:1,pageRows:50},callback);
 设置分页信息：$(selector).skpages('getPages'，callback);
 */
(function ($) {																//闭包限定命名空间
    $.fn.skpages = function(){
        var data;
        if(arguments.length === 0 || typeof arguments[0] === 'object'){
            var option = arguments[0]
                , options = $.extend(true, {}, $.fn.skpages.defaults, option);
                data = this.data('skpages');
            if (!data) {
                data = new Skpage(this[0], options);
                data._init_check_opt();
                data._init();
                this.data('skpages', data);
            }
            return $.extend(true, this, data);
        }
        if(typeof arguments[0] === 'string'){
            data = this.data('skpages');
            if($.isPlainObject(arguments[1])){
                $.extend(data.default,arguments[1]);
                data._init_check_opt();
            }
            var fn =  data["_"+arguments[0]];
            if(fn){
                if(arguments[2])arguments[2](fn);
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(data,args.slice(1));
            }
        }

    };

    $.fn.skpages.defaults = {
        total:0,                                                                //总条数
        currentPage:1,                                                          //当前页
        pageRows:50,                                                            //每页条数
        totalPage:1,                                                            //总页数
        afterSetPages:null                                                     //设置分页信息后操作
    };

    var Skpage=function (element,opt) {
        this.$scope=$(element);
        this.default=opt;
    };

    Skpage.prototype={
        _init:function () {
            var _this=this.$scope;
            var opt=this.default;
            var _html=
                "<div class='rox-pageInfo'>" +
                "   <span>共</span><span class='rox-total' dbfield='total'>"+opt.total+"</span><span style='margin-right: 0.2em;'>条</span>" +
                "   <span>每页</span><input type='text' class='rox-pageRows' dbfield='pageRows' value='"+opt.pageRows+"'><span style='margin-right: 0.2em;'>条</span>" +
                "   <span>第</span><input type='text' class='rox-currentPage' dbfield='currentPage' value='"+opt.currentPage+"'>/<span class='rox-totalPage'>"+opt.totalPage+"</span><span>页</span>" +
                "</div>" +
                "<div class='rox-pageBtn'>" +
                "   <a href='javascript:void(0)' type='start' class='rox-page-btn'><i class='icon-diyiye'></i></a>" +
                "   <a href='javascript:void(0)' type='prev' class='rox-page-btn'><i class='icon-shangyiye'></i></a>" +
                "   <a href='javascript:void(0)' type='next' class='rox-page-btn'><i class='icon-xiayiye'></i></a>" +
                "   <a href='javascript:void(0)' type='end' class='rox-page-btn'><i class='icon-moye'></i></a>" +
                "</div>" +
                "<div class='clear'></div>";
            $(_this).html(_html);
            this._bindClick();
            this._bindChange();
            //var _obj_html=$(_html).appendTo(_this);

            //if(options.hasOwnProperty("afterSetPages"))options.afterSetPages({currentPage:options.currentPage,pageRows:options.pageRows});
        },
        _init_check_opt:function () {
            var opt=this.default;
            if(!parseInt(opt.total)||parseInt(opt.total)<0)opt.total=0;
            if(!parseInt(opt.currentPage)||parseInt(opt.currentPage)<1)opt.currentPage=1;
            if(!parseInt(opt.pageRows)||parseInt(opt.pageRows)<1)opt.pageRows=50;
            opt.totalPage=parseInt(opt.total/opt.pageRows);
            if(opt.total%opt.pageRows||!opt.totalPage)opt.totalPage+=1;
            if(opt.currentPage>opt.totalPage)opt.currentPage=opt.totalPage;
        },
        _bindClick:function () {
            var _this=this.$scope;
            var opt=this.default;
            var _self=this;
            $(".rox-page-btn",_this).off("click").on("click",function(){
                //console.log(JSON.stringify(options));
                var _type=$(this).attr("type");
                var page;
                switch(_type){
                    case "start":
                        page=0;
                        break;
                    case "prev":
                        page=opt.currentPage-1;
                        break;
                    case "next":
                        page=opt.currentPage+1;
                        break;
                    case "end":
                        page=opt.totalPage;
                        break;
                    default:
                        break;
                }
                //console.log(page);
                _self._beforeSetPages(page);
            });
        },
        _bindChange:function () {
            var _this=this.$scope;
            var _self=this;
            $(".rox-pageRows,.rox-currentPage",_this).off("change").on("change",function(){
                _self._beforeChangePages(this);
            });
        },
        _beforeChangePages:function (_this) {
            var opt=this.default;
            var _that=this.$scope;
            var _prop=$(_this).attr("dbfield");
            var _val=parseInt($(_this).val());
            if(!_val||_val<1)_val=1;
            if(_prop=="currentPage"&&_val>opt.totalPage)_val=opt.totalPage;
            if(_prop=="pageRows"){
                opt.currentPage=1;
                opt.totalPage=parseInt(opt.total/_val);
                if(opt.total%_val)opt.totalPage+=1;
                //console.log(options,options.totalPage);
                $(".rox-currentPage",_that).val(1);
                $(".rox-totalPage",_that).text(opt.totalPage);
            }
            opt[_prop]=_val;
            $(_this).val(_val);
            //console.log(JSON.stringify(options));
            if(opt.hasOwnProperty("afterSetPages"))opt.afterSetPages(opt);
        },
        _beforeSetPages:function (val) {
            var _this=this.$scope;
            var opt=this.default;
            if(val<1)val=1;
            if(val>opt.totalPage)val=opt.totalPage;
            //console.log(val,JSON.stringify(options));
            if(val==opt.currentPage)return false;
            opt.currentPage=val;
            $(".rox-currentPage",_this).val(val);
            if(opt.hasOwnProperty("afterSetPages"))opt.afterSetPages({currentPage:opt.currentPage,pageRows:opt.pageRows});
        },
        _setPages:function () {
            var _that=this.$scope;
            var opt=this.default;
            if(_that.length){
                $("[dbfield]",_that).each(function () {
                    var _prop=$(this).attr("dbfield");
                    $(this).val(opt[_prop]).text(opt[_prop]);
                });
            }
            return true;
        },
        _getPages:function () {
            return this.default;
        }
    }
})(window.jQuery);