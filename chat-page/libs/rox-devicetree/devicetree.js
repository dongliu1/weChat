/** 
	$('#mydevicetree').sktree({								//初始化设备树
		maxLayerShow:2,										//默认显示几层
		nodeclick:devicetree_onclick						//点击节点函数 参数：event, node
	});
	//插件核心定义在最后
*/



(function (factory) {															//增加amd支持
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(window.jQuery);
    }
}(function ($) {

	"use strict";																//严格模式(执行速度会更快)：所有变量必须定义
	var defaults = {
        maxLayerShow:2,															//默认显示几层
        nodeclick: null,														//获取文件夹内容后的执行函数 参数：event, node
		editable:false,															//是否可以添删改
		contextmenu:{},
    };
	
	var SkTree = function (element, options) {									//类的入口函数
		//var sktree = this;
		this.$element = $(element);												//初始化的dom对象
		this.options = $.extend({}, defaults, options);							//合并默认参数与调用参数
		this._init();															//初始化
		//this.$element.on('mouseover', function (e) {sktree.roxover(e);});
	};
 

	SkTree.prototype = {
		//myAttribute: 'value',													//类的属性
		//_privateMethod: function () {},										//类的私有函数
		treedata:null,															//从服务器取回的树形数据转json
		treemap:{"-1":{id:-1,parentId:-1,nodeLayer:0,name:"全部"}},				//treedata转出的 id=>节点对象 映射表
				
		_init:function(){														//初始化函数
			var cls= this;														//class = this
			var $sktree=cls.$element;
			
			$sktree.addClass("sktree");
			$sktree.attr("nodeid",-1);
			var str='<div class="sktree-node">';
			str   +=' <div class="sktree-nodediv" nodeid="-1">';
			str   +='  <i class="sktree-icon fa fa-caret-down" ></i> <span class="sktree-name">'+cls.treemap[-1].name+'</span>';
			str   +=' </div>';
			str   +=' <ul class="sktree-root sktree-holder" holderid="-1"> </ul>';
			str   +="</div>"
			var rootHolder=$(str).appendTo($sktree);
			cls._render();

		},
		_render:function(){														//主程序，画出sktree
			var cls= this;
			var treeholder=cls.$element;
			if( typeof commonCallbackObj !== "undefined" ){
				$(".sktree-root",treeholder).html("");							//清空树
				if(!cls.treedata){
					var strTreeData=commonCallbackObj.getNodesTree("");			//服务器获取设备树数据
					if(strTreeData!="" && strTreeData!="False"){
						cls.treedata=$.parseJSON(strTreeData);					//转为json对象
						cls.treemap[-1].children=cls.treedata;
					}
				}
				var holderid=-1;
				cls._recurse_render(holderid,cls.treedata);						//递归画子树
				cls._after_render();	
			}
		},
		refresh_data:function(){
			var cls= this;
			var _recurse_getchild=function(nodeid,nodechildren){
				var parentid=nodeid;
				var parentLayer=(cls.treemap.hasOwnProperty(parentid))?cls.treemap[parentid]["nodeLayer"]:0;
				$.each(nodechildren,function(index,ichild){
					cls.treemap[ichild.id]=ichild;
					ichild.nodeLayer=parentLayer+1;
					ichild.parentData=cls.treemap[parentid];
					if(ichild.children) _recurse_getchild(ichild.id,ichild.children);
				});
			};
			
			asyncCommonObj["getNodesTree"]("").then(function (strTreeData){//服务器获取设备树数据
				if(strTreeData!="" && strTreeData!="False"){
					cls.treedata=$.parseJSON(strTreeData);							//转为json对象
					cls.treemap={"-1":{id:-1,parentId:-1,nodeLayer:0,name:"全部",children:cls.treedata}};
					_recurse_getchild(-1,cls.treedata)
				}
			});
		},
		getPath:function(nodeid){
			var cls=this;
			var nodedata=cls.treemap[nodeid];
			var strPath=nodedata.name;
			if(nodedata.hasOwnProperty("parentData")){
				strPath=cls.getPath(nodedata.parentData.id)+"->"+strPath;
			}
			return strPath;
		},
		
		_after_render:function(){												//_render后重新激活点击和右键功能
			var cls= this;
			cls._init_contextmenu();											//右键菜单
			cls._init_node_onclick();											//显示/隐藏子树
			if(cls.options.afterRender)cls.options.afterRender(cls);
		},
		
		_recurse_render:function(parentid,treedata){							//递归画子树
			var cls= this;
			var treeholder=cls.$element;
			var tree_parent=$("[holderid='"+parentid+"']",treeholder);
			
			var parentLayer=(cls.treemap.hasOwnProperty(parentid))?cls.treemap[parentid]["nodeLayer"]:0;
			var padding=(parentLayer+1)*10;		//px
			$.each(treedata,function(index,itree){
				var str='<li class="sktree-node">';
				str   +=' <div class="sktree-nodediv" nodeid="'+itree.id+'" style="padding-left:'+padding+'px">';
				str   +='  <i class="sktree-icon fa fa-caret-right" title="点击展开/收起"></i>';
				str   +='  <span class="sktree-name">'+itree.name+'</span>';
				str   +='</div></li>';
				itree.nodeLayer=parentLayer+1;
				itree.parentData=cls.treemap[parentid];
				//if(!cls.treemap[parentid].subnodes)cls.treemap[parentid].subnodes=[];
				//cls.treemap[parentid].subnodes.push(itree);
				var treenode=$(str).appendTo(tree_parent);
				var isclosed=false;
				if(itree.children) {
					var itreeholder=$('<ul class="sktree-holder" holderid="'+itree.id+'"></ul>').appendTo(treenode);
					if(cls.options.maxLayerShow && parentLayer>=cls.options.maxLayerShow-1){
						$(".sktree-icon",treenode).removeClass("fa-caret-down").addClass("fa-caret-right");
						isclosed=true;
						$(itreeholder).hide();
					}else{
						$(".sktree-icon",treenode).removeClass("fa-caret-right").addClass("fa-caret-down");
					}
				}
				cls.treemap[itree.id]=itree;
				if(itree.children) cls._recurse_render(itree.id,itree.children);
			});
		},
		_init_contextmenu:function(){											//右键菜单
			var cls=this;
			if(!cls.options.editable)return;
			var treeholder=this.$element;
			
			var items= {
					"addnode":{
						name: "新建设备",
						icon: "fa-plus",
						callback: function(key, opt){
							var node=this;
							cls._addnode(node);
						}
					},
					"editnode":{
						name: "设备更名",
						icon: "fa-edit",
						callback: function(key, opt){
							var node=this;
							cls._editnode(node);
						}
					},
					"delnode": {
						name: "删除设备",
						icon: "fa-trash",
						callback: function(key, opt){
							var node=this;
							cls._delnode(node);
						}
					},
					"addroot":{
						name: "新建根设备",
						icon: "fa-plus",
						callback: function(key, opt){
							var node=this;
							cls._addnode(node);
						}
					},
					"rmtree":{
						name: "删除设备树",
						icon: "fa-trash",
						callback: function(key, opt){
							var node=this;
							skalert("此功能暂未开放");
							//cls._delnode(node);
						}
					},
					"empty":{
						name: "清空测点",
						icon: "fa-trash",
						callback: function(key, opt){
							var node=this;
                            skalert("此功能暂未开放");
							//cls._delnode(node);
						}
					}
				};
			if(cls.options.contextmenu.items)$.extend(items, cls.options.contextmenu.items);
			//console.log(treeholder)
			$(treeholder).contextMenu({						
				selector: '.sktree-nodediv',
				//context: treeholder,
				events: {
					show : function(options){
						var node=this;

						var nodeid=$(node).attr("nodeid");
                        //console.log(nodeid)
						if(nodeid==0){
							options.items["addnode"].visible=false;
							options.items["editnode"].visible=false;
							options.items["delnode"].visible=false;
							options.items["addroot"].visible=false;
							options.items["rmtree"].visible=false;
							//options.items["empty"].visible=true;
							options.items["empty"].visible=false;		//临时关闭,待外壳提供清空测点功能
							return false;
						}else if(nodeid!=-1){
							options.items["addnode"].visible=true;
							options.items["editnode"].visible=true;
							options.items["delnode"].visible=true;
							options.items["addroot"].visible=false;
							options.items["rmtree"].visible=false;
							options.items["empty"].visible=false;
							
						}else{
							options.items["addnode"].visible=false;
							options.items["editnode"].visible=false;
							options.items["delnode"].visible=false;
							options.items["addroot"].visible=true;
							//options.items["rmtree"].visible=true;
							options.items["rmtree"].visible=true;		//临时关闭,待外壳提供清空设备树功能
							//options.items["empty"].visible=true;
							options.items["empty"].visible=false;		//临时关闭,待外壳提供清空测点功能
							//return false;
						}
						if(cls.options.contextmenu.show){
							var nodedata=cls.treedata[nodeid];
							cls.options.contextmenu.show(options,nodedata);
						}
					},
					
				},
				items:items,
			});
			
			/*$.contextMenu({						
				selector: '',
				context: treeholder,
				events: {
					show : function(options){
						
					},
				},
				items: {
					"addroot":{
						name: "新建根设备",
						icon: "fa-plus",
						callback: function(key, opt){
							var node=this;
							cls._addnode(node);
						}
					},
				}
			});*/
		},
		
		_init_node_onclick:function(){											//点击节点: 点击图标,显示/隐藏子树; 点击名称操作
			var cls=this;
			var treeholder=this.$element;
			
			$(".sktree-icon",treeholder).off("click").on("click",function(e){		//显示/隐藏子树
				e.stopPropagation();
				$(this).toggleClass("fa-caret-right").toggleClass("fa-caret-down");
				var next=$(this).parent().next();
				if($(next).hasClass("sktree-holder"))$(next).toggle();
			});
			$(".sktree-nodediv",treeholder).off("click").on("click",function(e){		//点击名称动作
				e.stopPropagation();
				//console.log(e);
				$(".sktree-nodediv",treeholder).removeClass("sktree-active");
				$(this).addClass("sktree-active");
				var nodeid=$(this).attr("nodeid");
				var nodedata=cls.treemap[nodeid];
                //console.log(nodedata);
				if(cls.options.nodeclick) cls.options.nodeclick(e,nodedata);
			});
		},
		_addnode:function(parentNode){											//添加节点
			var cls=this;
			var treeholder=this.$element;
			var parentid=$(parentNode).attr("nodeid")-0;
			var parentdata=cls.treemap[parentid];
			var parentLayer=parentdata.nodeLayer;
			var msg="<div>文件名：<br><input name='nodename' value='' placeholder='请输入设备名称'><br><span class='sktree-error'></span></div>";
			var title="添加设备";
			skalert(msg,title,function(dlg){
				$(".sktree-error",dlg).html("");
				if( typeof commonCallbackObj == "undefined" ){
					$(".sktree-error",dlg).html("请检查客户端服务程序");
					return false;
				}
				
				var nodename=$('[name="nodename"]',dlg).val();
				var iret=cls._verify_nodename(nodename);				//验证nodename是否合规
				if(!iret.success){
					$(".sktree-error",dlg).html(iret.msg);
					return false;							
				}
				iret=cls._check_nodename(nodename,parentdata);			//在同胞中查看是否有同名节点
				if(!iret.success){
					$(".sktree-error",dlg).html(iret.msg);
					return false;			
				}				
				var node={"name":nodename,"id":0, "parentId": (parentid==-1)?0:parentid, "nodeCount":0, "nodeIds":[], "pointCount":0, "pointIds":[] };
				var deviceid=commonCallbackObj.postNode(JSON.stringify(node));				//添加设备
				//console.log(deviceid);
				if(deviceid>=0){
					var itreeholder=$("[holderid='"+parentid+"']",treeholder);
					//var _prefix="";
					if(itreeholder.length==0)itreeholder=$('<ul class="sktree-holder" holderid="'+parentid+'"></ul>').insertAfter(parentNode);
					var padding=(parentLayer+1)*10;		//px
					//for(var i=0;i<parentLayer+1;i++)_prefix+=" &nbsp; &nbsp; ";
					var str='<li class="sktree-node">';
					str   +=' <div class="sktree-nodediv" nodeid="'+deviceid+'" style="padding-left:'+padding+'px;">';
					str   +='  <i class="sktree-icon fa fa-caret-right" title="点击展开/收起"></i>';
					str   +='  <span class="sktree-name">'+nodename+'</span>';
					str   +='</div></li>';
					var treenode=$(str).appendTo(itreeholder);
					cls.refresh_data();
					cls._after_render();
				}

                var actnode=$(".sktree-active")	;								//按需求，编辑后刷新测点表格
                var actnodeid=actnode.attr("nodeid");				//按需求，编辑后刷新测点表格
                if($(".sktree-active").length==0){
                    actnode=$("[nodeid='-1']");
                    actnodeid=-1;
                }
                var actnodedata=cls.treemap[actnodeid];
                if(cls.options.nodeclick) cls.options.nodeclick(actnode,actnodedata);
				return true;
			});
		},
		_delnode:function(objNode){												//删除节点
			var cls=this;
			var treeholder=this.$element;
			
			if( typeof commonCallbackObj == "undefined" ){
				skalert("请检查客户端服务程序");
				return false;
			}
			
			var nodeid=$(objNode).attr("nodeid");
			var nodedata=cls.treemap[nodeid];

			var msg="<div>确认删除设备吗？<br><span class='sktree-error'></span></div>";
			var title="删除设备";
			skalert(msg,title,function(dlg){
				$(".sktree-error",dlg).html("");
				if( typeof commonCallbackObj == "undefined" ){
					$(".sktree-error",dlg).html("请检查客户端服务程序");
					return false;
				}
				var nodeids={"ids":[nodeid]};
				if(commonCallbackObj.deleteNode(JSON.stringify(nodeids))=="True"){
					var parentid=nodedata.parentId;
					if(parentid==0)parentid=-1;
					var sblings=cls.treemap[parentid].children;
					$.each(sblings,function(i,ichild){
						if(ichild)
						if(ichild.id==nodeid)
							sblings.splice(i,1);
					});
					delete cls.treemap[nodeid];
					$(objNode).parent().children().remove();

                    var actnode=$(".sktree-active")	;								//按需求，编辑后刷新测点表格
                    var actnodeid=actnode.attr("nodeid");				//按需求，编辑后刷新测点表格
                    if($(".sktree-active").length==0){
                        actnode=$("[nodeid='-1']");
                        actnodeid=-1;
                    }
                    var actnodedata=cls.treemap[actnodeid];
                    if(cls.options.nodeclick) cls.options.nodeclick(actnode,actnodedata);
					return true;
				}else{
					$(".sktree-error",dlg).html("删除失败");
					return false;
				}
			
			});
			
		},
		_editnode:function(objNode){											//编辑节点
			var cls=this;
			var treeholder=this.$element;
			var nodeid=$(objNode).attr("nodeid")-0;
			var nodedata=cls.treemap[nodeid];
			var nodename=nodedata.name;
			var parentid=nodedata.parentId;

			var msg="<div>文件名：<br><input name='nodename' value='"+nodename+"' placeholder='请输入设备名称'><br><span class='sktree-error'></span></div>";
			var title="编辑设备";
			skalert(msg,title,function(dlg){
				$(".sktree-error",dlg).html("");
				if( typeof commonCallbackObj == "undefined" ){
					$(".sktree-error",dlg).html("请检查客户端服务程序");
					return false;
				}
				
				var newNodename=$('[name="nodename"]',dlg).val();
				var iret=cls._verify_nodename(newNodename);				//验证nodename是否合规
				if(!iret.success){
					$(".sktree-error",dlg).html(iret.msg);
					return false;							
				}
				
				var parentdata=cls.treemap[parentid];
				iret=cls._check_nodename(newNodename,parentdata,nodeid);	//在同胞中查看是否有同名节点
				if(!iret.success){
					$(".sktree-error",dlg).html(iret.msg);
					return false;			
				}
				
				//编辑节点
				var node={"name":newNodename,"id":nodeid,"parentId":nodedata.parentId-0,"nodeCount":0,"nodeIds":[],"pointCount":0,"pointIds":[]};
				//console.log(JSON.stringify(node));
				var ireturn=commonCallbackObj.putNode(JSON.stringify(node));
				if(ireturn=="True"){
					//console.log($(".sktree-name",objNode).length);
					$(".sktree-name",objNode).html(newNodename);
					nodedata.name=newNodename;
					msgbox("修改成功","success");
					return true;
				}else{
					msgbox("修改失败");
					return false;
				}

				if(commonCallbackObj.putNode(json)=="True")$("[deviceid='"+nodeid+"'] span:first").html(nodename);

                var actnode=$(".sktree-active")	;								//按需求，编辑后刷新测点表格
                var actnodeid=actnode.attr("nodeid");
                if($(".sktree-active").length==0){
                    actnode=$("[nodeid='-1']");
                	actnodeid=-1;
                }
                var actnodedata=cls.treemap[actnodeid];
                if(cls.options.nodeclick) cls.options.nodeclick(actnode,actnodedata);
				
				return true;
			});
			

		},
		_verify_nodename:function(nodename){									//验证nodename是否合规
			nodename = nodename.replace(/^(\s|\u00A0)+/,'').replace(/(\s|\u00A0)+$/,'');  
			if(nodename==""){
				return {"success":false,msg: "设备名称不能为空！"};
			}
			if(nodename.indexOf("/")>=0 || nodename.indexOf(";")>=0){
				return {"success":false,msg: "设备名称不能包含  \"/\" 及 \";\" 等符号！"};
			}
			return {"success":true};
		},
		_check_nodename:function(nodename,parentdata,nodeid){					//在同胞中查看是否有同名节点 nodeid有值用于编辑时检查，无值用于添加时检查
			if(!parentdata.children)return {"success":true};
			for (var i = 0; i < parentdata.children.length; i++) {		
				var ichild=parentdata.children[i];
				if(ichild.name==nodename && (typeof(nodeid)=="undefined"  || ichild.nodeid!=nodeid)){
					return {"success":false,msg: "已经存在同名设备！"};
				}
			}
			return {"success":true};
		},
		
		getdata:function(nodeid){
			//console.log("ssssssssssssssssss");
			//console.log(this.treemap);
			var nodedata=this.treemap[nodeid];
			//console.log(nodedata);
			return nodedata;
		},
	};

    $.fn.sktree = function (option) {
		
		var args = Array.prototype.slice.call(arguments);
        //return this.each(function (i,obj) {
            var $this = $(this),
                data = $this.data('sktree'),
                options = typeof option === 'object' && option;
            if (!data) {
                $this.data('sktree', (data = new SkTree(this, options)));
            } else if (typeof option === 'string') {
				return data[option].apply(data, args.slice(1));
            }
			return data;
        //});
    };
	
}));
