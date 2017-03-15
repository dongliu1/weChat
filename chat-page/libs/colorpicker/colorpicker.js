(function($) {
    var ColorHex=new Array('00','33','66','99','CC','FF');
    var SpColorHex=new Array('FF0000','00FF00','0000FF','FFFF00','00FFFF','FF00FF');
    $.fn.colorpicker = function(options) {
        var opts = jQuery.extend({}, jQuery.fn.colorpicker.defaults, options);
        initColor();
		$(this).addClass("has-colorpicker");
        return this.each(function(){
            var obj = $(this);
            obj.bind(opts.event,function(){
                //定位
                var ttop  = $(this).offset().top;     //控件的定位点高
                var thei  = $(this).height();  //控件本身的高
                var tleft = $(this).offset().left;    //控件的定位点宽
                $("#rox_colorpicker_palette").css({
                    top:ttop+thei+5,
                    left:tleft
                }).show();
                var target = opts.target ? $(opts.target) : obj;
                if(target.data("color") == null){
                    target.data("color",target.css("color"));
                }
                if(target.data("value") == null){
                    target.data("value",target.val());
                }
          
                $("#rox_colorpicker_palette .colorpicker_reset").bind("click",function(){
                    target.css("color", target.data("color")).val(target.data("value"));
                    $("#rox_colorpicker_palette").hide();
                    opts.reset(obj);
                });
          
                $("#rox_colorpicker_palette .rox_colortable tr td").unbind("click").mouseover(function(){
                    var color=$(this).css("background-color");
                    $("#rox_colorpicker_palette .rox_color_display").css("background",color);
                    $("#rox_colorpicker_palette .rox_color_hex").val($(this).attr("rel"));
                }).click(function(){
                    var color=$(this).attr("rel");
                    color = opts.ishex ? color : getRGBColor(color);
                    if(opts.fillcolor) target.val(color);
                    target.css("color",color);
                    $("#rox_colorpicker_palette").hide();
                    $("#rox_colorpicker_palette .colorpicker_reset").unbind("click");
                    opts.success(obj,color);
                });
          
            });
        });
    
        function initColor(){
            $("body").append('<div id="rox_colorpicker_palette" style="position:absolute;display:none;padding:3px;background-color:#fff;box-shadow:0 0 10px #333;border-radius:3px" class="has-colorpicker"></div>');
            var colorTable = '';
            var colorValue = '';
            for(i=0;i<2;i++){
                for(j=0;j<6;j++){
                    colorTable=colorTable+'<tr height=12>'
                    colorTable=colorTable+'<td width=11 rel="#000000" style="background-color:#000000">'
                    colorValue = i==0 ? ColorHex[j]+ColorHex[j]+ColorHex[j] : SpColorHex[j];
                    colorTable=colorTable+'<td width=11 rel="#'+colorValue+'" style="background-color:#'+colorValue+'">'
                    colorTable=colorTable+'<td width=11 rel="#000000" style="background-color:#000000">'
                    for (k=0;k<3;k++){
                        for (l=0;l<6;l++){
                            colorValue = ColorHex[k+i*3]+ColorHex[l]+ColorHex[j];
                            colorTable=colorTable+'<td width=11 rel="#'+colorValue+'" style="background-color:#'+colorValue+'">'
                        }
                    }
                }
            }
            colorTable='<div style="height:30px">'
			+'<input type="text" class="rox_color_display" size="6" disabled style="border:solid 1px #000000;background-color:#ffff00"><input type="text" class="rox_color_hex" size="7" style="border:inset 1px;font-family:Arial;display:none" value="#000000">'
			+'<a href="javascript:void(0);" class="colorpicker_close" style="position:absolute;top:-1px;right:3px"><i class="fa fa-close"></i></a><a href="javascript:void(0);" class="colorpicker_reset"  style="display:none">清除</a></div>'
            +'<table class="rox_colortable" border="1" cellspacing="0" cellpadding="0" style="border-collapse: collapse" bordercolor="000000"  style="cursor:pointer;">'
            +colorTable+'</table>';
            $("#rox_colorpicker_palette").html(colorTable);
            $("#rox_colorpicker_palette .colorpicker_close").on('click',function(){
                $("#rox_colorpicker_palette").hide();
                return false;
            }).css({
                "font-size":"12px",
                "padding-left":"20px"
            });
			$(document).click(function(event) {
				
				if (!$(event.target).closest(".has-colorpicker").length) {
					$("#rox_colorpicker_palette").hide();
				}
			});
        }
        
        function getRGBColor(color) {
            var result;
            if ( color && color.constructor == Array && color.length == 3 )
                color = color;
            if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
                color = [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];
            if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
                color =[parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];
            if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
                color =[parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];
            if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
                color =[parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];
            return "rgb("+color[0]+","+color[1]+","+color[2]+")";
        }
    };
    jQuery.fn.colorpicker.defaults = {
        ishex : true, //是否使用16进制颜色值
        fillcolor:false,  //是否将颜色值填充至对象的val中
        target: null, //目标对象
        event: 'click', //颜色框显示的事件
        success:function(){}, //回调函数
        reset:function(){}
    };
})(jQuery);