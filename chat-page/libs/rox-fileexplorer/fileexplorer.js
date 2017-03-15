/**
	打开文件：$(this).skfiles('open',{suffix:'dtr',afterOpen:func1,afterShow:func2});
	保存文件：$(this).skfiles('save',content,{suffix:'dtr',afterSave:func1,afterShow:func2});

*/
(function ($) {																	//闭包限定命名空间
    var options={};																//参数，本插件的全局变量
    var defaultOptions = {														//默认参数
        suffix:"",																//文件后缀
		enableSuffixFilter:true,												//按后缀过滤
		afterOpen: null,														//获取文件夹内容后的执行函数
		afterShow: null,															//打开dlg后的执行函数
		afterSave:null,															//保存完成后
		afterDelete:null,														//删除完成后
		filename:"",															//默认的保存文件名
		content:"",																//文件内容（指针类型的）
		display:"icon",															//icon,detail
		saveCoverAlert:false,													//保存时，如存在同名弹出警示框
    };
	var FILETYPES={"dtr":"trend","trd":"trend","sct":"scatter","crl":"correlation","dbc":"dataquery"};								//后缀与类型的映射表
	
	$.fn.extend({																//扩展jquery功能：skfiles
        "skfiles": function (mode ,opts1, opts2) {
        	switch (mode){														//便于添加多功能
				case "save":													//保存文件
                    var opts=opts2;
                    if (!isObject(opts))	return this;							//检测用户传进来的参数是否合法
                    options = $.extend({}, defaultOptions, opts); 					//使用jQuery.extend 覆盖插件默认参数
                    options.mode="save";
                    options.content=opts1;
                    _dlg._savefile();
					break;
				case "open":													//打开文件
                    var opts=opts1;
                    if (!isObject(opts))	return this;							//检测用户传进来的参数是否合法
                    options = $.extend({}, defaultOptions, opts); 					//使用jQuery.extend 覆盖插件默认参数
                    options.mode="open";
                    _dlg._openfile();
					break;
				case "delete":													//删除文件
                    var opts=opts1;
                    if (!isObject(opts))	return this;							//检测用户传进来的参数是否合法
                    options = $.extend({}, defaultOptions, opts); 					//使用jQuery.extend 覆盖插件默认参数
                    options.mode="delete";
                    _fileListAction._delete();
					break;
				default:
					skalert("暂未开放"+mode+"功能。");
					break;
			}
            /*if(mode=="save"){													//保存文件
				var opts=opts2;
				if (!isObject(opts))	return this;							//检测用户传进来的参数是否合法
				options = $.extend({}, defaultOptions, opts); 					//使用jQuery.extend 覆盖插件默认参数
				options.mode="save";
				options.content=opts1;
				_dlg._savefile();
			}else{																//打开文件
				var opts=opts1;
				if (!isObject(opts))	return this;							//检测用户传进来的参数是否合法
				options = $.extend({}, defaultOptions, opts); 					//使用jQuery.extend 覆盖插件默认参数
				options.mode="open";
				_dlg._openfile();
			}*/
        }
    });
	
    var isObject=function(obj) {												//私有方法，检测参数是否合法
        return !obj || (obj && typeof obj === "object") ? true : false;
    }
		
	var _dlg={																	//对话窗口，打开/保存文件
		_openfile:function(){													//打开文件窗口
			var html='<div id="roxexplorer-dlg" mode="open">'
					+'<div class="roxtree-pathholder">当前路径: &nbsp; <span id="roxexplorer-currPath"></span></div>'
					+'<div id="roxexplorer-folderTree" style="width:20%"></div><div id="roxexplorer-fileList"></div>'
					+'</div>';
			$(html).dialog({
				title: "打开文件",
				height:480,
				width:750,
				modal: true,
				resizable:false,
				open: function( event, ui ) {
					$(this).next().prepend('<div style="position:absolute;bottom:0.5em;right:10em;left:2em;" ><div id="dlg_filename_box" style="width:100%;display:none"> '
						+ '    <div style="position:absolute;line-height:2em;font-size:small">文件名：</div>'
						+ '    <div style="width:100%;padding-left:5em"><input id="dlg_filename" class="dlg_filename" style="width:100%"></div>'
						+ '</div></div>');
					if(options.afterShow)options.afterShow(event,ui);
				},
				close: function( event, ui ) {$( this ).dialog( "destroy" );},
				buttons: {
					/*"打开": function() {
						_fileListAction._open($("#roxexplorer-currPath").text()+"/"+$("#dlg_filename").val());
						$( this ).dialog( "close" );
						//return ifile;
					}*/
				}
			});
			var currentFilename=options.filename;
			//console.log(currentFilename);
			var idx=currentFilename.lastIndexOf("/");
			var filetype=FILETYPES[options.suffix];
			var path=(idx>-1)?currentFilename.substring(0,idx):filetype;
			var filename=(idx>-1)?currentFilename.substr(idx+1):"";
			_fileList._render(path);							//获取根目录内容
			_folderTree._render(filetype);						//通过后缀锁定filetype目录 比如trd对应trend
		},
		_savefile:function(){													//保存文件窗口
			
			var html='<div id="roxexplorer-dlg" mode="save">'
					+'<div class="roxtree-pathholder">当前路径: &nbsp; <span id="roxexplorer-currPath"></span></div>'
					+'<div id="roxexplorer-folderTree" ></div><div id="roxexplorer-fileList"></div>'
					+'</div>';
			$(html).dialog({
				title: "保存文件",
				height:490,
				width:750,
				modal: true,
				resizable:false,
				open: function( event, ui ) {
					$(this).next().prepend('<div style="position:absolute;bottom:0.5em;right:10em;left:2em;" ><div id="dlg_filename_box" style="width:100%;"> '
						+ '    <div style="position:absolute;line-height:2em;font-size:small">文件名：</div>'
						+ '    <div style="width:100%;padding-left:5em"><input id="dlg_filename" class="dlg_filename" style="width:100%"></div>'
						+ '</div></div>');
					var currentFilename=options.filename;
					var idx=currentFilename.lastIndexOf("/");
					var filetype=FILETYPES[options.suffix];
					var path=(idx>-1)?currentFilename.substring(0,idx):filetype;
					var filename=(idx>-1)?currentFilename.substr(idx+1):"";
					_fileList._render(path);							//获取根目录内容
					_folderTree._render(filetype);						//通过后缀锁定filetype目录 比如trd对应trend
					$("#dlg_filename").val(currentFilename);
					if(options.afterShow)options.afterShow(event,ui);
				},
				close: function( event, ui ) {$( this ).dialog( "destroy" );},
				buttons: {
					" 保 存 ": function() {
						var ifile={};
						if($.trim($('#dlg_filename').val())==""){
							skalert("文件名不能为空！");
							return;
						}else{//$("#roxexplorer-currPath").text()+"/"+$(this).text()
							var filename=$("#roxexplorer-currPath").text()+"/"+$("#dlg_filename").val();
							if(!_fileListAction._save(filename))return;
						}

						$( this ).dialog( "close" );
					}
				}
			});
			
			
			
			/*var suffix=options.suffix;
			var filetype=FILETYPES[suffix];
			var currentFilename=options.filename;
			var html='<div id="roxexplorer-dlg" mode="save">'
					+'<div class="roxtree-pathholder">当前路径: &nbsp; <span id="roxexplorer-currPath"></span></div>'
					+'<div id="roxexplorer-folderTree" style="widht:20%"></div><div id="roxexplorer-fileList"></div>'
					+'</div>';
			$(html).dialog({
				title: "保存文件",
				height:480,
				width:750,
				modal: true,
				resizable:false,
				open: function( event, ui ) {
					$(this).next().prepend('<div style="position:absolute;bottom:0.5em;right:10em;left:2em;" ><div id="dlg_filename_box" style="width:100%;"> '
						+ '    <div style="position:absolute;line-height:2em;font-size:small">文件名：</div>'
						+ '    <div style="width:100%;padding-left:5em"><input id="dlg_filename" class="dlg_filename" style="width:100%"></div>'
						+ '</div></div>');
					if(options.afterShow)options.afterShow(event,ui);
				},
				close: function( event, ui ) {$( this ).dialog( "destroy" );},
				buttons: {
					" 保 存 ": function() {
						var ifile={};
						if($.trim($('#dlg_filename').val())==""){
							skalert("文件名不能为空！");
							return;
						}else{
							var filename=options.current_path+"/"+$("#dlg_filename").val();
							_fileListAction._save(filename);
						}
						$( this ).dialog( "close" );
					}
				}
			});
			var currentFilename=options.filename;
			var idx=currentFilename.lastIndexOf("/");
			var filetype=FILETYPES[options.suffix];
			var path=(idx>-1)?currentFilename.substring(0,idx):filetype;
			var filename=(idx>-1)?currentFilename.substr(idx+1):"";
			_fileList._render(path);							//获取根目录内容
			_folderTree._render(filetype);						//通过后缀锁定filetype目录 比如trd对应trend
			$("#dlg_filename").val(filename);
			*/
		},
	}
	
	var _folderTree={															//目录树，相关操作
		_render: function(filetype){											//显示目录树：_folderTree的主要函数
			if(!filetype){
				skalert("请选择文件类型(filetype)");
				return;
			}
			var folders = commonCallbackObj.getFolder(filetype, "", "");
			if(folders=="" || folders=="False"){
				skalert("获取文件夹信息失败！");
				return;
			}
			folders = $.parseJSON(folders);
			
			folders.name ="远程文件";											//添加根目录名称，远程
			//folders=[folders,{name:"本地文件"}];								//添加根目录名称，本地
            folders=[folders];
			var treeobj=$("<ul class='roxtree-root roxtree-holder' holderid='root'></ul>").appendTo("#roxexplorer-folderTree");
			
			_folderTree._recursion_render(folders,'root');						//递归渲染 tree
			$(treeobj).children("li:eq(0)").addClass("roxtree-active");			//激活第一行
			
			_folderTree._folder_onClick();										//点击文件夹名称，改变当前目录
			_folderTree._folderIcon_onClick();									//点击文件夹图标，显示/隐藏子文件夹
			_folderTree._container_onContextmenu();								//目录树容器 的 右键
			_folderTree._folder_onContextmenu();								//目录行 的 右键
			
		},	
		_recursion_render:function(pfolders,treeid){							//递归函数，渲染tree
			var objParent=$(".roxtree-holder[holderid='"+treeid+"']");
		
			$.each(pfolders,function(i,folders){
				var iTreeid=treeid+"-"+i;
				var obj = $("<li class='roxtree-folder' folderid='"+iTreeid+"'><i class='roxtree-icon fa fa-folder-open'></i><span>"+folders.name+"</span></li>").appendTo(objParent);
				//如果没有远程和本地之分，需重写path（下面一行）
				var path=(typeof($(objParent).data("path"))=="undefined")?FILETYPES[options.suffix]:$(objParent).data("path")+"/"+folders["name"];
				$(obj).data("path",path);
				if(folders.hasOwnProperty("folder")){
					var holder=$("<ul class='roxtree-holder' holderid='"+iTreeid+"'></ul>").appendTo(objParent);
					$(holder).data("path",path);
					_folderTree._recursion_render(folders["folder"],iTreeid);
				}
			})
		},
		_folder_onClick:function(){												//点击文件夹名称，改变当前目录
			$('.roxtree-folder').off("click").on("click",function(){	
				$(".roxtree-folder").removeClass("roxtree-active");	
				$(this).closest("li").addClass("roxtree-active");		//改变本行颜色
				
				var path=$(this).data("path");							//改变文件框内容
				_fileList._render(path);
			});
		},
		_folderIcon_onClick:function(){											//点击文件夹图标，显示/隐藏子文件夹
			$('.roxtree-icon').off("click").on("click",function(e){		//打开关闭子文件夹
				$(this).toggleClass("fa-folder-open").toggleClass("fa-folder");
				var next=$(this).parent().next();
				if($(next).hasClass("roxtree-holder"))$(next).toggle();
				//$(this).parent().next().hide();
				e.stopPropagation(); 
				return false;
			});
		},
		_container_onContextmenu:function(){									//目录树容器 的右键
			/*$.contextMenu({							
				selector: '#roxexplorer-folderTree',
				events: {
					show : function(options){
						
					},
				},
				items: {
					"_addfolder_remote":{
						name: "新建文件夹",
						callback: function(key, opt){
							path="/test";
							_folderTreeAction._addfolder(path);
						}
					},
				}
			});*/
		},
		_folder_onContextmenu:function(){										//目录行 的右键
			$.contextMenu({						
				selector: '.roxtree-folder',
				events: {
					show : function(options){
						if($(this).parent().hasClass("roxtree-root")){
							options.items["delfolder"]["visible"]=false;
							options.items["editfolder"]["visible"]=false;
						}else{
							options.items["delfolder"]["visible"]=true;
							options.items["editfolder"]["visible"]=true;
						}
					},
				},
				items: {
					"_addfolder_remote":{
						name: "新建文件夹",
						icon: "fa-plus",
						callback: function(key, opt){
							var treeitem=this;
							_folderTreeAction._addfolder(treeitem);
						}
					},
					"editfolder":{
						name: "文件夹更名",
						icon: "fa-edit",
						callback: function(key, opt){
							var treeitem=this;
							_folderTreeAction._editfolder(treeitem);
						}
					},
					"delfolder": {
						name: "删除文件夹",
						icon: "fa-trash",
						callback: function(key, opt){
							var treeitem=this;
							_folderTreeAction._delfolder(treeitem);
						}
					}
				}
			});
		},
	}
		
	var _folderTreeAction={														//文件夹操作，与服务器交互
		_delfolder:function(treeitem){											//远程文件夹  删除 
			var path=($(treeitem).data("path"));
			var idx=path.indexOf("/");
			var filetype=(idx>-1)?path.substring(0,idx):path;
			var filepath=(idx>-1)?path.substr(idx):"/";
			isSuccess=commonCallbackObj.deleteFolder(filetype,"",filepath,false);
			if(isSuccess=="False"){
				skalert("删除失败,请检查目录中是否有文件未删除！");
				return;
			}else{
				msgbox("已经删除"+path);
				$(treeitem).remove();
			}
		},
		_addfolder:function(treeitem){											//远程文件夹  添加 
			var path=($(treeitem).data("path"));
			var idx=path.indexOf("/");
			var filetype=(idx>-1)?path.substring(0,idx):path;
			var filepath=(idx>-1)?path.substr(idx):"/";
			var msg="<div>文件名：<br><input name='foldername' value='' placeholder='请输入文件名'></div>";
			var title="添加文件夹";
			skalert(msg,title,function(dlg){
				var foldername=$('[name="foldername"]',dlg).val();
				if(!foldername)return;
				var isfolder = commonCallbackObj.getFolder(filetype, filepath, foldername);
				if(isfolder!="False"){				//是否重名
					skalert(filepath+"/"+foldername+"<br> 文件夹已经存在!");
					return false;
				}
				
				//新建文件夹
				//filepath="";foldername="aaa";
				//var isSuccess = commonCallbackObj.postFolder("report", "文件夹", "");
				var isSuccess = commonCallbackObj.postFolder(filetype, filepath, foldername);
				console.log(filetype, filepath, foldername);
				if(isSuccess=="False"){
					skalert("新建文件夹失败！");
					return false;
				}else{
					var mychildren=treeitem.next();
					var fullpath=path+"/"+foldername;
					var childs=0;
					var iTreeid="";
					if(!$(mychildren).hasClass("roxtree-holder")){
						var myparent=$(treeitem).closest(".roxtree-folder");
						iTreeid=$(myparent).attr("holderid")+"-0";
						var mychildren=$("<ul class='roxtree-holder' holderid='"+iTreeid+"'></ul>").insertAfter(treeitem);
						$(mychildren).data("path",fullpath);
					}else{
						iTreeid=$(mychildren).attr("holderid")+"-"+$("li",mychildren).length;
					}
					var ichild = $("<li class='roxtree-folder' folderid='"+iTreeid+"'><i class='roxtree-icon fa fa-folder-open'></i><span>"+foldername+"</span></li>").appendTo(mychildren);
				
					$(ichild).data("path",fullpath);
					
					_folderTree._folder_onClick();										//点击文件夹名称，改变当前目录
					_folderTree._folderIcon_onClick();									//点击文件夹图标，显示/隐藏子文件夹
					_folderTree._container_onContextmenu();								//目录树容器 的 右键
					_folderTree._folder_onContextmenu();								//目录行 的 右键
				}
				return true;
			});
		},	
		_editfolder:function(treeitem){											//远程文件夹  更名 
			var oldpath=$(treeitem).data("path");
			var idx=oldpath.indexOf("/");
			if(idx<0){
				skalert("不能修改根目录！");
				return false;
			}
			var filetype=oldpath.substring(0,idx);
			var filepath=oldpath.substr(idx+1);
			var lidx=filepath.lastIndexOf("/");			
			var oldfilename=(lidx<0)?filepath:filepath.substr(lidx+1);
			
			filepath=(lidx<0)?"":filepath.substring(0,lidx);
			console.log(lidx,oldfilename,filepath)
			var isfolder = commonCallbackObj.getFolder(filetype, filepath, oldfilename);
			if(isfolder=="False"){										//未找到文件夹！
				skalert("未找到文件夹！"+filepath+"/"+oldfilename);
				return false;
			}
				
			var msg="<div>文件名：<br><input name='foldername' value='"+oldfilename+"' placeholder='请输入文件名'></div>";
			var title="文件夹 重命名";
			skalert(msg,title,function(dlg){
				var foldername=$('[name="foldername"]',dlg).val();
				if(!foldername)return;
				
				var isfolder = commonCallbackObj.getFolder(filetype, filepath, foldername);
				if(isfolder!="False"){				//是否重名
					skalert("文件夹已经存在，请重新命名");
					return false;
				}
				
				var isSuccess = commonCallbackObj.renameFolder(filetype, filepath, oldfilename, foldername);
				if(isSuccess=="False") {
					skalert("重命名 失败！");
					return false;
				}
				//console.log(isSuccess,filetype,filepath,foldername);
				var fullpath=filetype+"/"+filepath+"/"+foldername;
				$(treeitem).data("path",fullpath);
				var next=$(treeitem).next();
				if($(next).hasClass("roxtree-holder")){
					$(next).data("path",$(next).data("path").replace(oldpath,fullpath));
					$(".roxtree-holder,.roxtree-folder",next).each(function(i,iobj){
						$(iobj).data("path",$(iobj).data("path").replace(oldpath,fullpath));
					});
				}
				$("span",treeitem).html(foldername);
				return true;
			});
		},	
	
	};
	
	
	var _fileList={																//文件列表 相关操作
		_render:function(path){													//文件列表 显示[主函数]
			options.current_path=path;												//存入options
			$(".context-menu-list").hide();
			var idx=path.indexOf("/");
			var filetype=(idx>-1)?path.substring(0,idx):path;
			var filepath=(idx>-1)?path.substr(idx+1):"/";
			$("#roxexplorer-fileList").html("");//.data("current_path",path);
			$("#roxexplorer-currPath").html(path);
			
			var files=$.parseJSON(commonCallbackObj.getFolder(filetype,filepath, ""));	//获取文件夹内容
			
			if(filepath!="/"){															//不是根目录，就添加上层目录这个文件夹
				$("#roxexplorer-fileList").append("<div class='roxexplorer-folder'>"
					+"<i class='fa fa-fw fa-reply' style='color: #A7A721;'></i>"
					+"<span class='itemname'>上层目录</span>"
					+ "</div>");
			}
					
			$(files.folder).each(function(ikey,iobj){									//列出folder
				$("#roxexplorer-fileList").append("<div class='roxexplorer-folder'>"
					+"<i class='fa fa-fw fa-folder' style='color: #A7A721;'></i>"
					+"<span class='itemname'>"+iobj.name+"</span>"
					+ "</div>");
			});
			
			$(files.file).each(function(ikey,ifile){									//列出文件
				var iname=ifile.name;
				if(!options.enableSuffixFilter || iname.substr(iname.lastIndexOf(".")+1)==options.suffix){
					$("#roxexplorer-fileList").append("<div class='roxexplorer-file' data-toggle='context' data-target='#file-context-menu'>"
						+"<i class='fa fa-fw fa-line-chart' ></i>"
						+"<span class='itemname' >"+iname+"</span>"
						+ "</div>");
				}
			});
			
			_fileList._folder_onDblClick();
			_fileList._file_onDblClick();
			_fileList._file_onClick();
			_fileList._onContextmenu();
		},
		_onContextmenu:function(){												//文件列表 右键菜单
			$.contextMenu({
				selector: '.roxexplorer-file,.roxexplorer-folder',
				events: {
					show : function(options){
						$("#roxexplorer-fileList .roxexplorer-file").removeClass("active");
						this.addClass("active");
						$("#dlg_filename").val($(this).text());
						if($(this).hasClass("roxexplorer-folder")){
							options.items._editfile.visible=false;
							options.items._delfile.visible=false;
							options.items._editfolder.visible=true;
							options.items._delfolder.visible=true;
						}else{
							options.items._editfile.visible=true;
							options.items._delfile.visible=true;
							options.items._editfolder.visible=false;
							options.items._delfolder.visible=false;
						}
						
						
					},
				},
				items: {
					_editfile:{
						name: "修改文件",
						icon: "edit",
						callback: function(key, opt){
							_fileListAction._editfile(this);
						}
					},
					_delfile: {
						name: "删除文件",
						icon: "fa-trash",
						callback: function(key, opt){
							if($(this).hasClass("folder")){
								var fullpath=$("#roxexplorer-currPath").text()+"/"+$(this).text();
								var idx=fullpath.indexOf("/");
								var filetype=(idx>-1)?fullpath.substring(0,idx):fullpath;
								var filepath=(idx>-1)?fullpath.substr(idx):"/";
								isSuccess=commonCallbackObj.deleteFolder(filetype,"",fullpath,false);
								console.log(isSuccess);
								if(isSuccess=="False"){
									skalert("删除失败,请检查目录中是否有文件未删除！");
									return;
								}else{
									$(this).remove();
								}
							}else{
								var filename=$("#roxexplorer-currPath").text()+"/"+$(this).text();
								var idx=filename.indexOf("/");
								var filetype=(idx>-1)?filename.substring(0,idx):filename;
								var filepath=(idx>-1)?filename.substr(idx):"/";
                                var content=commonCallbackObj.getFile(filetype, "", filepath);			//从服务器读取文件数据
                                var ifile={filename:filename,filepath:filepath,filetype:filetype,content:content};
								var isdelete=commonCallbackObj.deleteFile(filetype, "", filepath);
								if(isdelete=="False"){
									skalert("服务器删除失败,请检查路径是否正确。");
									return false;
								}
								console.log(options);
								if(options.afterDelete)options.afterDelete(ifile);
								$(this).remove();
							}
						}
					},
					_editfolder:{
						name: "重命名文件夹",
						icon: "fa-edit",
						callback: function(key, opt){
							_fileListAction._editfolder(this);
						}
					},
					_delfolder:{
						name: "删除文件夹",
						icon: "fa-trash",
						callback: function(key, opt){
							_fileListAction._delfolder(this);
						}
					},
					
				}
			});
		},
		_file_onClick:function(){												//文件单击 其实没用了
			$("#roxexplorer-fileList .roxexplorer-file").on('click',function(){						//文件单击，选中文件
				$("#roxexplorer-fileList .roxexplorer-file").removeClass("active");
				$(this).addClass("active");
				$("#dlg_filename").val($(this).text());
			});
		},
		_file_onDblClick:function(){											//文件双击 打开文件
			$("#roxexplorer-fileList .roxexplorer-file").on('dblclick',function(){
				if(options.mode=="open"){
					_fileListAction._open($("#roxexplorer-currPath").text()+"/"+$(this).text());
				}else{
					_fileListAction._save($(this).text(),$("#roxexplorer-currPath").text());
				}
				$(this).closest("#roxexplorer-dlg").dialog( "close" );
			});
		},
		_folder_onDblClick:function(){											//文件夹双击 打开
			$("#roxexplorer-fileList .roxexplorer-folder").on('dblclick',function(){
				var myfolder=$(".itemname",this).text();
				var current_path=options.current_path;
				if(myfolder=="上层目录"){
					current_path=current_path.substring(0,current_path.lastIndexOf("/"));
				}else{
					current_path +=((current_path=="/")?"":"/")+myfolder;
				}
				_fileList._render(current_path);
			});
		},
	}
			
	var _fileListAction={														//文件操作，与服务器交互
		_open:function(filename){												//加载文件，并执行回调
			if(typeof(filename)=="undefined" || filename=="")return;
			var idx=filename.indexOf("/");
			var filetype=(idx>-1)?filename.substring(0,idx):filename;
			var filepath=(idx>-1)?filename.substr(idx):"/";
			var lidx=filename.lastIndexOf("/")
			var shortname=filename.substr(lidx+1);
			var path=filename.substring(0,idx);
			var content=commonCallbackObj.getFile(filetype, "", filepath);			//从服务器读取文件数据
			if(content=="False"){skalert("未找到文件");return;}	
			//console.log(filename,filepath,)
			var ifile={fullname:filename,filename:shortname,path:path,filetype:filetype,content:content};
			if(options.afterOpen)options.afterOpen(ifile);							//如果定义了afterOpen，执行该函数
		},
		_save:function(filename){												//保存文件，并执行回调
			var suffix=options.suffix;
			if(filename.substr(filename.lastIndexOf("."))!="."+suffix)filename +="."+suffix;
			var idx=filename.indexOf("/");
			var filetype=(idx>-1)?filename.substring(0,idx):FILETYPES[options.suffix];
			var filepath=(idx>-1)?filename.substr(idx):"/";
            var lidx=filename.lastIndexOf("/");
            var shortname=filename.substr(lidx+1);
			var content=(typeof(options.content)=="string")?options.content:JSON.stringify(options.content);
			var isAddnew=false;
			console.log("aaaaaa");
            console.log(filetype,"",filepath, content);
			var iresult=commonCallbackObj.postFile(filetype, "", filepath, content);
			console.log(iresult);
			if(iresult=="False"){
				//console.log(options.saveCoverAlert,filename)
				if(options.saveCoverAlert){
                    skalert("存在同名文件:<br>"+filename+"<br>新增失败！");
					return false;
                }
                console.log("bbbbb");
				console.log(filetype,"",filepath, content);
				var iresult=commonCallbackObj.putFile(filetype, "", filepath, content);
				console.log(iresult);
				if(iresult=="False"){
					skalert("覆盖文件:"+filename+"失败！");
					return false;
				}else{
					msgbox("成功覆盖文件:"+filename);
				}
			}else{
                if(!options.saveCoverAlert){
                	isAddnew=true;
                }
				msgbox("成功保存文件:"+filename);
			}
			var ifile={filepath:filepath,filename:shortname,filetype:filetype,content:content,isAddnew:isAddnew};
			if(options.afterSave)options.afterSave(ifile);
			return true;
		},
		_delete:function () {
			var filetype=options.filetype;
			var filepath=options.filepath;
            var isdelete=commonCallbackObj.deleteFile(filetype, "", filepath);
            if(isdelete=="False"){
                skalert("服务器删除失败,请检查路径是否正确。");
                return false;
            }
            console.log(options);
            if(options.afterDelete)options.afterDelete();
        },
		_editfile:function(fileitem){											//远程文件	 更名 
			var oldfilename=$(".itemname",fileitem).text();
			var current_path=options.current_path;
			var oldpath=current_path+"/"+oldfilename;
			var idx=oldpath.indexOf("/");
			var filetype=(idx>-1)?current_path.substring(0,idx):current_path;
			var filepath=(idx>-1)?current_path.substr(idx+1):"";
			
			var isfolder = commonCallbackObj.getFile(filetype, filepath, oldfilename);
			if(isfolder=="False"){										//未找到文件夹！
				skalert("未找到文件！"+filepath+"/"+oldfilename);
				return false;
			}
				
			var msg="<div>文件名：<br><input name='filename' value='"+oldfilename+"' placeholder='请输入文件名'></div>";
			var title="文件 重命名";
			skalert(msg,title,function(dlg){
				var filename=$('[name="filename"]',dlg).val();
				if(!filename)return;
				
				var isfolder = commonCallbackObj.getFile(filetype, filepath, filename);
				if(isfolder!="False"){				//是否重名
					skalert("文件["+filename+"]已经存在，请重新命名");
					return false;
				}
				
				var isSuccess = commonCallbackObj.renameFile(filetype, filepath, oldfilename, filename);
				if(isSuccess=="False") {
					skalert("重命名 失败！");
					return false;
				}
				
				$(".itemname",fileitem).html(filename);
				return true;
			});
		},	
		_delfile:function(fileitem){											//远程文件   删除
			var filename=$(".itemname",fileitem).text();
			var current_path=options.current_path;
			//var path=current_path+"/"+foldername;
			var idx=current_path.indexOf("/");
			var filetype=(idx>-1)?current_path.substring(0,idx):current_path;
			var filepath=(idx>-1)?current_path.substr(idx+1):"";
			//console.log(filetype,filepath,foldername)
			isSuccess=commonCallbackObj.deleteFolder(filetype,filepath,filename,false);
			if(isSuccess=="False"){
				skalert("删除失败！");
				return;
			}else{
				msgbox("已经删除"+path);
				$(fileitem).remove();
			} 
		},
		_editfolder:function(folderitem){										//远程文件夹 更名 
			var oldfilename=$(".itemname",folderitem).text();
			var current_path=options.current_path;
			var oldpath=current_path+"/"+oldfilename;
			var idx=oldpath.indexOf("/");
			var filetype=(idx>-1)?current_path.substring(0,idx):current_path;
			var filepath=(idx>-1)?current_path.substr(idx+1):"";

			var isfolder = commonCallbackObj.getFolder(filetype, filepath, oldfilename);
			if(isfolder=="False"){										//未找到文件夹！
				skalert("未找到文件夹！"+filepath+"/"+oldfilename);
				return false;
			}
				
			var msg="<div>文件名：<br><input name='foldername' value='"+oldfilename+"' placeholder='请输入文件名'></div>";
			var title="文件夹 重命名";
			skalert(msg,title,function(dlg){
				var foldername=$('[name="foldername"]',dlg).val();
				if(!foldername)return;
				
				var isfolder = commonCallbackObj.getFolder(filetype, filepath, foldername);
				if(isfolder!="False"){				//是否重名
					skalert("文件夹已经存在，请重新命名");
					return false;
				}
				
				var isSuccess = commonCallbackObj.renameFolder(filetype, filepath, oldfilename, foldername);
				if(isSuccess=="False") {
					skalert("重命名 失败！");
					return false;
				}
				
				$(".itemname",folderitem).text(foldername);
				return true;
			});
		},	
		_delfolder:function(folderitem){										//远程文件夹 删除
			var foldername=$(".itemname",folderitem).text();
			var current_path=options.current_path;
			//var path=current_path+"/"+foldername;
			var idx=current_path.indexOf("/");
			var filetype=(idx>-1)?current_path.substring(0,idx):current_path;
			var filepath=(idx>-1)?current_path.substr(idx+1):"";
			//console.log(filetype,filepath,foldername)
			isSuccess=commonCallbackObj.deleteFolder(filetype,filepath,foldername,false);
			if(isSuccess=="False"){
				skalert("删除失败,请检查目录中是否有文件未删除！");
				return;
			}else{
				msgbox("已经删除"+path);
				$(folderitem).remove();
			}
		}
	}
	

})(window.jQuery);
