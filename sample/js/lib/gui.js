//================================================
// GUIまとめ
// 2018.05.14 作成
// 2018.11.24 onTapの引数を修正
//================================================
var GUI = {
	//================================================
	// タップイベント登録
	//================================================
	//onTap:function( input , callback ) {
	onTap:function( selector , shortTap , longTap ) {
		// var selector = input.selector;
		// var shortTap = input.shortTap;
		// var longTap  = input.longTap;
		var touch_time=0;
		var touched   =false;
		var timer     = null;

		selector.bind('touchstart',function(e) {
			touched = true;
			touch_time = 0;
			timer = setInterval(function(){
				touch_time += 100;
				if (touch_time == 1000) {
					clearInterval(timer);
					longTap( selector );
				}
			},100);
			e.preventDefault();//キャンセル可能であればキャンセルする
		});

		selector.bind('touchend',function(e) {
			if (touched) {
				if (touch_time < 1000 ) shortTap( selector );
			}
			touched = false;
			clearInterval(timer);
			e.preventDefault();
		});

		// callback(null,null);
	},

	//================================================
	// 指定した場所にタッチエフェクト表示
	//================================================
	showTapEffect:function(input,callback){
		//input.selector
		//input.x
		//input.y
		var pointer = $('<div>').addClass("touchPointer");
		pointer.css("top",(input.y-30)+"px");
		pointer.css("left",(input.x-30)+"px");
		input.selector.append( pointer );
		setTimeout(function(){
			pointer.remove();
		},500);
		callback(null);
	},

	//================================================
	// bodyタッチのエフェクト表示
	//================================================
	enableBodyTouchEffect:function(){
		//ボードにタッチしたときのエフェクト登録
		$('body').bind("touchstart",function(e) {
			var input  ={
				selector : $('body'),
				x : e.originalEvent.touches[0].pageX,
				y : e.originalEvent.touches[0].pageY,
			};
			//console.log(input.x + ':' + input.y);
			GUI.showTapEffect(input,function(err){});
		});
	},

};

