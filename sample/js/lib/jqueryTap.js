/* jQuery Tap Event */
// http://utsutsunogare.com/tap-event-with-jquery/
// unbindするときも.off("tap")
(function($, window) {
	"use strict";

	var RANGE = 5,
		events = ["click", "touchstart", "touchmove", "touchend"],
		handlers = {
			click: function(e) {
				if(e.target === e.currentTarget)
					e.preventDefault();
			},
			touchstart: function(e) {
				this.jQueryTap.touched = true;
				this.jQueryTap.startX = e.touches[0].pageX;
				this.jQueryTap.startY = e.touches[0].pageY;
			},
			touchmove: function(e) {
				if(!this.jQueryTap.touched) {
					return;
				}

				if(Math.abs(e.touches[0].pageX - this.jQueryTap.startX) > RANGE ||
				   Math.abs(e.touches[0].pageY - this.jQueryTap.startY) > RANGE) {
					this.jQueryTap.touched = false;
				}
			},
			touchend: function(e) {
				if(!this.jQueryTap.touched) {
					return;
				}

				//-- 2019.04.01 改造 lemo
				// NOTE: 親との併発禁止 , 300msec後に発動するclickイベントの禁止
				e.preventDefault();
				e.stopPropagation();
				//--

				//-- 2020.04.20 改造 lemo
				// NOTE:二つ以上のボタンの同時押しを防ぐ
				if(window.disableJqueyTap){
					console.log('同時押し禁止');
					return;
				}
				else{
					window.disableJqueyTap = true;
					const delay = ( window.jqueyTapDelay ) ? window.jqueyTapDelay : 0 ;
					console.log('tapディレイは', delay );
					setTimeout(()=>{window.disableJqueyTap=false;},delay);
				}
				//--

				this.jQueryTap.touched = false;
				$.event.dispatch.call(this, $.Event("tap", {
					originalEvent: e,
					target: e.target,
					pageX: e.changedTouches[0].pageX,
					pageY: e.changedTouches[0].pageY
				}));
			}
		};

	$.event.special.tap = "ontouchend" in window? {
		setup: function() {
			var thisObj = this;
			
			if(!this.jQueryTap) {
				Object.defineProperty(this, "jQueryTap", {value: {}});
			}
			$.each(events, function(i, ev) {
				thisObj.addEventListener(ev, handlers[ev], false);
			});
		},
		teardown: function() {
			var thisObj = this;
			
			$.each(events, function(i, ev) {
				thisObj.removeEventListener(ev, handlers[ev], false);
			});
		}
	}: {
		bindType: "click",
		delegateType: "click"
	};

	$.fn.tap = function(data, fn) {
		return arguments.length > 0? this.on("tap", null, data, fn): this.trigger("tap");
	};
})(jQuery, this);