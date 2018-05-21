$(document).ready(function(){

	disqus_shortname = 'http-www-pmblom-com';
	disqus_url = "http://www.pmblom.com"; 
	disqus_identifier = "";

	$(".info-link").on("mouseenter", function(evt){
		if($(window).width() > 1080){
			var file = $(this).data("img").split(".")[0];
			$(".paris_bw").addClass("hidden");
			$("."+file).removeClass("hidden");
			$(".fun-fact").html($(this).data("funfact"));
		}
	})

	$(".info-link").on("mouseout", function(evt){
		if($(window).width() > 1080){
			var file = $(this).data("img").split(".")[0];
			$(".paris_bw").removeClass("hidden");
			$("."+file).addClass("hidden");
			$(".fun-fact").html("");
		}
	})

	$(".top-menu-item").on("click", function(evt){
		evt.preventDefault();
		if($(window).width() <= 1080){ //"mobile"
			var el = $(this).find(".top-menu-item-text").data("scrollto");
			var elementTop = $(el).position().top;
			var currentScroll = $(".main-content").scrollTop();
			var leftBarHeight = $(".main-content-leftbar").height();
			if(elementTop != currentScroll || elementTop-leftBarHeight<0){
				$(".main-content").animate({
					scrollTop: elementTop + leftBarHeight 
				}, 500)			
			}
		} else { //desktop?
			var el = $(this).find(".top-menu-item-text").data("scrollto");
			var currentScroll = $(".content").scrollTop();
			if($(el).position().top != $(".content").scrollTop() || $(el).position().top<0){
				$('.content').animate({
			        scrollTop: $(el).position().top + $(".content").scrollTop()
			    }, 500);
			}
		}
		
		
	})

	$(".content-blog-title").on("click", function(evt){
		if(!$(this).hasClass("content-blog-title-active")){
			loadDisqus($(this).siblings(".content-blog-text").find(".content-blog-text-bottom"), $(this).data("id"), disqus_url);
			$.each($(this).parent().parent().find(".content-blog-item").find(".content-blog-title"), function(k,v){ //close other open blog posts (helps for disqus)
				if($(v).hasClass("content-blog-title-active")){
					$(v).trigger("click");
				}
			})
			$('.content').animate({
	            scrollTop: $(this).position().top + $(".content").scrollTop()
	        }, 500);
			$(this).find(".content-blog-title-icon").addClass("fa-caret-right").removeClass("fa-caret-down");
			$(this).siblings(".content-blog-text").removeClass("hidden");
			$(this).addClass("content-blog-title-active");
		} else {
			$(this).find(".content-blog-title-icon").addClass("fa-caret-down").removeClass("fa-caret-right");
			$(this).siblings(".content-blog-text").addClass("hidden");
			$(this).removeClass("content-blog-title-active");
		}
	})



	if(window.location.hash != ""){
		$(window.location.hash).trigger("click");
	}

})

function loadDisqus(source, identifier, url) {
	console.log(source, identifier, url);

	if (window.DISQUS) {

	   $('#disqus_thread').insertAfter(source); //append the HTML after the link

	   //if Disqus exists, call it's reset method with new parameters
	   DISQUS.reset({
	      reload: true,
	      config: function () {
	      this.page.identifier = identifier;
	      this.page.url = url + "/#!" + identifier;
	      }
	   });

	} else {

	   //insert a wrapper in HTML after the relevant "show comments" link
	   $('<div id="disqus_thread"></div>').insertAfter(source);
	   disqus_identifier = identifier; //set the identifier argument

	   //append the Disqus embed script to HTML
	   var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
	   dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
	   $('head').append(dsq);

	}
};