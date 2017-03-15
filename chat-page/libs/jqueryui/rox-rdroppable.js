$.widget( "custom.droppabler", {

      options: {
        accept: "*",
		activeClass: false,
		addClasses: true,
		greedy: false,
		hoverClass: "ui-state-hover",
		//scope: "default",
		//tolerance: "intersect",

		// callbacks
		activate: null,
		deactivate: null,
		drop: null,
		out: null,
		over: null
      },
 
      // The constructor
      _create: function() {
		var proportions,
			o = this.options,
			accept = o.accept
			;

		this.isover = false;
		this.isout = true;

		this.accept = $.isFunction( accept ) ? accept : function( d ) {
			return d.is( accept );
		};
        this.element.addClass( "custom-droppabler" );
		this._on( this.element, {
          dragover: this._over,
		  dragleave: this._out,
		  drop: this._drop,
        });
      },
		
	  _over:function(e){
		  e.preventDefault();  
		  e.stopPropagation();
		  var o=this.options;
		  if(o.hoverClass)this.element.addClass(o.hoverClass);
	  },
	  _out:function(e){
		  e.preventDefault();  
		  e.stopPropagation();
		  var o=this.options;
		  if(o.hoverClass)this.element.removeClass(o.hoverClass);
	  },
	  _drop:function(e){
		  var o=this.options;
		  if(o.hoverClass)this.element.removeClass(o.hoverClass); 
		  if(o.drop){
			var ui={helper: e.originalEvent.dataTransfer.getData("text")};
			o.drop(e,ui);
		  }
		  e.preventDefault();  
		  e.stopPropagation(); 
	  },
 
      _destroy: function() {
        this.element.removeClass( "custom-droppabler" );
      },
 
      _setOption: function( key, value ) {
        this._super( key, value );
      }
    });

