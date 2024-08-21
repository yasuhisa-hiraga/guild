//page,area,group,panel,parts
//pageController
/*
ページの作り方
new page
pageのロード時の処理を書く
pageをコントローラーに登録する
コントローラーから呼び出したり非表示にしたりする..

(c) 2019 lemo
2019.03.04 created by lemo
version 0.1.2
*/


/**
 * コア
 * jquery div の拡張
 */
function JqueryTag ( tag ){
    let base = $('<div>');
    if(tag)base = $('<'+tag+'>');
    jQuery.extend( this , base );

    this.element = this.get(0);
    this._remove = this.remove;
    this.remove = null;
    this._empty = this.empty;
    this.empty = null;    
}

/**
 * 基本的に全ての要素はcoreobjectを継承すること
 */
// GUILD_CORE_ENABLE_TAP = true;
class CoreObject extends JqueryTag {
    constructor( tag ){
        super( tag );
        this.isCoreObject = true;
        this.parentObj= null;
        this.complate = null;
        let self = this;

        /* 2023/04/10 PCの子タップ伝播防止 */
        this._tap = this.tap;
        this.tap = (callback)=>{
            this.off('tap');//2024.6.11 : tapイベントは常に1つにしたいので、これまでのイベント登録を消す。offにしないとtap(()=>{})の処理が設定した分だけ重複する。
            this._tap((e)=>{
                e.stopPropagation();
                callback(e);
            });
        }


        this.childObj = [];
        this.addClass('coreObject');

        this.remove = function(){

            if( typeof self.dispose == 'function'){
                self.dispose();
            }

            if(self.name){
                if(self.name=='scenarioBoardPage'){
                    console.log('これからシナリオボード削除');
                    console.log('これ子');   
                    console.log(self.childObj);   
                }
            }

            // 自分の子要素全部を明示的にremove
            removeChild( self );

            if( self.parentObj ){
                for(var i=0;i<self.parentObj.childObj.length;i++){
                    if(self == self.parentObj.childObj[i]){
                        // console.log('parentObj.childObjから抜く');
                        // 消すと数か狂うので、nullで差し替える
                        self.parentObj.childObj[i] = null;
                        // self.parentObj.childObj.splice(i,1);
                        break;
                    }
                }
                self.parentObj = null;
            }
            self._remove();
            if(self.evDestroy)self.evDestroy();
        }

        function removeChild( _self ){
            if(_self){
                // console.log( 'length ' , _self.childObj.length );
                for(var i=0;i<_self.childObj.length;i++){
                    // console.log('i',i);
                    // console.log('remove > ' , _self.childObj[i]);
                    if( !_self.childObj[i] )continue;
                    if( typeof _self.childObj[i].remove == 'function' ){
                        _self.childObj[i].remove();
                    }
                }
                _self.childObj = [];
            }
       }

       // 子要素全部にremoveを走らせる
       this.empty = function(){
            removeChild( self );
            // それからのempty
            return this._empty();
       }
    }

   

    render(){
        // this.empty(); //わざわざやらんでもええやろ
        // this.childObj = []; //これやっちゃだめや。子をaddObjされた後にaddObjすると子要素を忘れちゃう 2022.06
    }
    onComplate( callback ){
        this.complate = callback;
    }
    fireComplate( arg ){
        if(this.complate)this.complate( arg );
    }
    addObj( coreObject ){
        coreObject.parentObj = this;
        this.append(coreObject);
        // empty()が必要かわからんので一回コメントアウト2020.12.18
        // coreObject.empty();// todo ここでやるならrender の this.empty() 復活させても同じか？
        coreObject.render();
        this.childObj.push( coreObject );
        return coreObject;//チェイン用
    }
    // 手前に配置
    preObj( coreObject ){
        coreObject.parentObj = this;
        this.prepend(coreObject);
        coreObject.render();
        this.childObj.push( coreObject );
    }
    getObj( attrName ){
        for(var i=0;i<this.childObj.length;i++){
            const c = this.childObj[i];
            if( c.attr('name') == attrName )return c;
        }
    }
    
    // オブジェクトがremoveされるときに呼ばれる
    onDestroy( callback ){
        this.evDestroy = callback;
    }
}

/**
 * CoreObjectの省略形
 */
function $c(tag){
    tag = tag.replace('<','').replace('>','');
    return new CoreObject(tag);
}

/**
 * ページ
 */
class Page extends CoreObject{
    constructor( pageName , tag ){
        super( tag );
        this.name = pageName;
        this.addClass('page');
        this.height  = window.innerHeight;
        this.width   = window.innerWidth;
        this.residue = this.height;//余剰の高さ
    }
    // NOTE:継承先で上書きする場合は、必ずsupre.render()を実行してから処理を追記すること
    // render内に描画処理を書く。
    render( props ){
        super.render();
        this.props = props;
        this.residue = this.height;//residueを初期化する

    }


    // NOTE:クラスの関数作成時の注意点 
    // superで予約されている関数はここでは上書きできないので注意
    // 上書きしたい場合はconstructorのthisから行う
    /**
     * エリアの登録
     * @param {} selector 
     */
    addArea( area ){
        // 高さ指定がされてないエリアの場合、残りの幅全部を与える
        if( area.height() == 0 ){
            area.css('height',this.residue+'px');
        }else{
            this.residue -= area.height();
            // pushlog(area.attr('name') +':'+ area.height() + '//' + 'this.residue' + this.residue );
        }
        this.addObj( area );
    }

    createArea( areaData ){
        const area = new Area( areaData );
        this.addArea( area );
        return area;
        //area.css('background-color','gray'); // テスト用
    }

    /**
     * エリア上に配置
     * @param {*} areaName 
     * @param {*} coreObject 
     */
    addOnArea( areaName , coreObject ){
        const area = this.getObj( areaName );
        area.addObj( coreObject );
    }
}

/**
 * エリア (ページの構成要素)
 */
class Area extends CoreObject{
    constructor( areaData ){
        super();
        const name   = areaData.name;
        const height = areaData.height;
        const position = areaData.position;
        const positionValue = areaData.positionValue;
        this.addClass('area');
        this.attr('name',name);
        if(height && height!='fr')this.css('height',height+'px');
        if(position)this.css( position , positionValue );
    }
}



/**
 * パネル
 */
class Panel extends CoreObject{
    constructor( tag ){
        super( tag );
        this.addClass('panel');
    }
    render(){
        super.render();
    }
}

/**
 * パーツ
 */
class Parts extends CoreObject{
    constructor( tag ){
        super( tag );
        this.addClass('parts');
    }
    render(){
        super.render();
    }
}


/**
 * ページのコントローラー
 */
class PageController{
    constructor(){
        this. _pointer = 0;
        this. _history = [];
        this. _currentPageName = "";
        this. _currentPage = null;
        this.pages = [];
    }

    add( page ){
        this.pages.push( page );
    }

    goto( pageName , props ){
		if(this._currentPageName != pageName)this.addHistory( pageName );
		this.changePage( pageName , props );
    }

    next(){
		if( this._pointer < this._history.length-1 ){
			this._pointer +=1;
			var pageName = this._history[ this._pointer ];
			this.changePage( pageName );
		}
	}

	prev (){
		if( this._pointer > 0 ){
			this._pointer -= 1;
			var pageName = this._history[ this._pointer ];
			this.changePage( pageName );
		}
	}

	reload (){
		if(this._currentPageName)this.changePage( this._currentPageName );
	}

    addHistory( pageName ){

		if( !this._history.length ){
			this._history.push( pageName );
			this._pointer = 0;
			return;
		}

		var list = [];
		for(var i=0;i<=this._history.length;i++){
			// 今ポインタが存在している位置にページを追加
			if( i==this._pointer+1){
				list.push( pageName );
				// ポインターを進める
				this._pointer++;
				break;
			}else {
				list.push( this._history[i] );
			}
		}
		this._history = list;
    }
    
    changePage( pageName , props ){
        console.log('show : ' + pageName );
        this._currentPageName = pageName;
        this.removeAllPage();
        for( let k in this.pages ){
            const p = this.pages[k];
            if( p.name == pageName ){
                this._currentPage = p;
                //setTimeout(()=>{
                    //$('body').append( p );
                    $('#content').append( p );
                    p.empty();
                    p.render( props );
                //},20);//removeにディレイを挟むようにしたので、それ以上のディレイが必要
            }
        }
    }

    removeAllPage(){
		for( let k in this.pages ){
            const p = this.pages[k];
            p.remove();
		}
	}

}
