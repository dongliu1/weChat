$(document).ready(function() {
	$('[data-toggle="tooltip"]').tooltip({
		container: 'body'
	});

	// Because it makes beautiful source code!
	$('.pre-container').each(function() {
		var dataType = $(this).data('type'),
			dataRun = ($(this).data('run') === true ? true : false),
			code = $(this).text().replace(/\n/, '').replace(/\t\t\t\t/g, '').replace(/^\s+|\s+$/g, '');
		$(this).html('<pre data-run="'+dataRun+'"><code class="'+dataType.toLowerCase()+'"></code></pre>');
		$(this).find('code').text(code);
	});

	// Add line numbers since Highlight.js does not include them.
	$('.pre-container').each(function() {
		var lines = $(this).find('pre').html().split(/\n/).length;
		$(this).prepend('<div class="[ line-numbers ]"></div>');
		for (iLoop = 1; iLoop < (lines + 1); iLoop++) { 
    		$(this).find('.line-numbers').append('<span class="[ line-number ]">' + iLoop + '</span>');
		}
		if ($(this).find('pre').data('run') === true) {
			$(this).append('<a href="#run-sample">Generate Notify!</a>');
		}
	});

	$('pre code').each(function(i, block) {
		hljs.highlightBlock(block);
	});

	$('a[href="#run-sample"]').on('click', function(event) {
		event.preventDefault();
		var code = $(this).prev('pre').find('code');
		eval(code.text());
		$.notifyDefaults({
			element: 'body',
			position: null,
			type: "info",
			allow_dismiss: true,
			newest_on_top: false,
			placement: {
				from: "top",
				align: "right"
			},
			offset: 20,
			spacing: 10,
			z_index: 1031,
			delay: 5000,
			timer: 1000,
			url_target: '_blank',
			mouse_over: null,
			animate: {
				enter: 'animated fadeInDown',
				exit: 'animated fadeOutUp'
			},
			onShow: null,
			onShown: null,
			onClose: null,
			onClosed: null,
			icon_type: 'class',
			template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert"><button type="button" aria-hidden="true" class="close" data-notify="dismiss">&times;</button><span data-notify="icon"></span> <span data-notify="title">{1}</span> <span data-notify="message">{2}</span><div class="progress" data-notify="progressbar"><div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div></div><a href="{3}" target="{4}" data-notify="url"></a></div>'
		});
	});

	$('nav.navbar-fixed-top').affix({
		offset: {
			top:  1
		}
	});

	$('nav.sidebar').affix({
		offset: {
			top:  function() {
				return $('#documentation').offset().top
			}
	  	}
	});
	$('nav.sidebar').on('affixed.bs.affix', function () {
		var right = (($(window).width() - $('section').width())/2)+95;
		$(this).css('right', right+'px');
	})
	$('nav.sidebar').on('affixed-top.bs.affix', function () {
		$(this).css('right', '0px');
	});

	$('.show-sub-menu').on('click', function(event) {
		event.preventDefault();
		$('nav.sidebar > div').removeClass('fadeOutUp').addClass('fadeInDown');
		$('nav.sidebar').css('pointer-events', 'auto');
	});
	$('.hide-sub-menu').on('click', function(event) {
		event.preventDefault();
		$('nav.sidebar > div').removeClass('fadeInDown').addClass('fadeOutUp');
		$('nav.sidebar').css('pointer-events', 'none');
	});

	$(window).scroll(function() {
		($(this).scrollTop() > ($('header').height() + 200)) ? $('.back-to-top').addClass('cd-is-visible') : $('.back-to-top').removeClass('cd-is-visible cd-fade-out');
	}).trigger('scroll');

	$(window).resize(function() {
		var right = (($(window).width() - $('section').width())/2)+95;
		if ($('nav.sidebar').hasClass('affix')) {
			$('nav.sidebar').css('right', right+'px');
		}
	}).trigger('resize');

	$('.back-to-top').on('click', function(event) {
		event.preventDefault();
		$('html,body').animate({
			scrollTop: 0
		}, 700);
	});

	$('body').on('activate.bs.scrollspy', function () {
  		$('.navbar-brand').animate({
  			left: '-'+$('.navbar-brand').outerWidth()+'px'
  		}, 300, function() {
  			$('.navbar-brand').text(($('nav li.active').text().length > 0) ? $('nav li.active').text() : $('nav .navbar-brand').text());
  			$('.navbar-brand').animate({
  				left: '0px'
  			}, 300);
  		});
	});

	$('a.jump-to[href^="#"]').on('click', function(event) {
		event.preventDefault();
		var $ele = $($(this).attr('href')),
			navHeight = $('.navbar-header').outerHeight() + 10;

		if (navHeight > 10){
			$('.navbar-toggle').trigger('click');
		}else{
			navHeight = $('nav').outerHeight();
		}

		$('a.hide-sub-menu').trigger('click');

		$('html, body').animate({
			scrollTop: $ele.offset().top - navHeight
		}, 700);
	});

	$('a[href="#twitter"]').sharrre({
		share: {
			twitter: true
		},
		text: '',
		template: '<span class="[ fa fa-twitter ]"></span>&nbsp;{total}',
		enableHover: false,
		enableTracking: true,
		buttons: { 
			twitter: {
				via: 'mouse0270'
			}
		},
		total: 69,
		click: function(api, options){
			api.simulateClick();
			api.openPopup('twitter');
		},
		url: 'http://bootstrap-notify.remabledesigns.com/'
	});

	$('a[href="#facebook"]').sharrre({
		share: {
			facebook: true
		},
		template: '<span class="[ fa fa-facebook ]"></span>&nbsp;{total}',
		enableHover: false,
		enableTracking: true,
		total: 163,
		click: function(api, options){
			api.simulateClick();
			api.openPopup('facebook');
		},
		url: 'http://bootstrap-notify.remabledesigns.com/'
	});

	$('a[href="#googleplus"]').sharrre({
		share: {
			googlePlus: true
		},
		template: '<span class="[ fa fa-google-plus ]"></span>&nbsp;{total}',
		total: 43,
		click: function(api, options){
			api.simulateClick();
			api.openPopup('googlePlus');
		},
		url: 'http://bootstrap-notify.remabledesigns.com/'
	});

	$('a[href="#githubstars"]').sharrre({
		share: {
			githubStars: true
		},
		template: '<span class="[ fa fa-star ]"></span>&nbsp;{total}',
		click: function(api, options){
			api.openPopup('githubStars');
		},
		url: 'https://github.com/mouse0270/bootstrap-notify'
	});

	$('form[action="#GenerateNotify"]').submit(function( event ) {
		event.preventDefault();
		var notify = $.notify({
			icon: $('[data-notify="icon"]').html(),
			title: $('[data-notify="title"]').html(),
			message: $('[data-notify="message"]').html(),
			url: $('[data-notify="url"]').html(),
			target: $('[data-notify="target"]').html()
		},{
			type: $('input[name="type"]:checked').val(),
			allow_dismiss: $('#demo-allow-dismiss').is(':checked'),
			newest_on_top: $('#demo-newest-on-top').is(':checked'),
			placement: {
				from: $('input[name="position"]:checked').val().split("-")[0],
				align: $('input[name="position"]:checked').val().split("-")[1]
			},
			offset: {
				x: $('#demo-offset-x-axis').val(),
				y: $('#demo-offset-y-axis').val()
			},
			spacing: $('#demo-spacing').val(),
			z_index: $('#demo-z-index').val(),
			delay: $('#demo-delay').val(),
			mouse_over: ($('#demo-pause-on-hover').is(':checked') ? "pause" : null)
		});
		return false;
	});
});