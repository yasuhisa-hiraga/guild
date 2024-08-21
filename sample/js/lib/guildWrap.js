
/*
guild.jsをラップする
*/

/**
 * div
 */
function $div( value ){
    return $c('<div>').append( value );
}

/**
 * input
 */
function $inp( value ){
    return $c('<input>').val( value );
}
function $btn( value ) {
    return $c('<button>').text( value );
}

/**
 * template を使えるようにする
 */
let TEMP = {};
class Template extends CoreObject{
    // constructor( props , tag ){
    //     super( tag );
    //     this.setprops( props || {} );
    // }
    // def(){
    //     this.props={};
    // }
    constructor( tag , defProps ){
        super( tag );
        this.props = defProps || {};
        this.objects = {};

        this.vfor = {};
        this.vforTag = '';
        // this.vforNum = 0;
        // this.vforIndex= 0;
        this.stockTemplates = '';
        this.vforParentname = '';
        this.vforParentIndex= null;
    }

    dispose(){
        this.objects = null;
        this.props = null;
        this.vfor = null;
    }
    
    setprops( props ){
        if(!props)return;
        // 上書き
        for( var key in props ){
            if(props[key]!==undefined)this.props[key] = props[key];
        }

    }

    template( temp , rootname ){
        // console.log('rootname' , rootname);
        // console.log(temp);

        // コメントアウト(//)がついている行を消す。
        temp = temp.replace(/\/\/s*[\w\W]+?(?=\n|$)/g,'');
        // console.log(temp);
        

        let list = temp.split(/\<|\>/g);
        // let list = temp.split(/\>/g);
        let parents = [];
        let index   = -1;

        // console.log('list:',list);

        for(var i=0;i<list.length;i++){
            // let classname = list[i].replace('\n\s+','').replace(/\s+/g,'');// + '>';


            // 改行とスペースを除いて何も残らない場合スキップ
            if(! list[i].replace('\n\s+','').replace(/\s+/g,'') )continue;
            

            // 頭に // (コメントアウト) がついている場合スキップ
            // console.log(list[i])
            // if( list[i].match(/\/\//g) )continue;


            

            // if(!classname)continue;

            // 改行削除
            let classname = list[i].replace('\n\s+','');
            // console.log( classname );



            // console.log( classname );
            classname = '<'+classname+'>';
            // classname = classname+'>';
            // console.log( classname );

            // vfor中の場合はストックする
            // 末尾 : <'/A' の場合はストックを終了する
            let vfortagtest = classname.replace(/\s+|\<|\>/g,'');
            // console.log('vfortagtest:',vfortagtest);
            if( '/' + this.vforTag == vfortagtest  ){
                // console.log('vforTagを終了');
                this.vforTag = '';
            }
            if( this.vforTag ){
                this.stockTemplates += classname;
                // console.log('this.stockTemplates:',this.stockTemplates);
                continue;
            }

            // 貯めたテンプレートを処理
            if(this.stockTemplates){
                let temp = '';
                for(var t=0;t<this.vfor.list.length;t++){
                    temp += this.stockTemplates;
                }
                this.stockTemplates = '';
                // console.log(temp);
                this.template( temp , this.vforParentname );

                // 初期化
                this.vfor = {};
            }


            let isParent = true;

            // 末尾 : '</A' 要素は配置せず。親の参照を1つ戻す
            if( classname.replace(/\s+/g,'').match(/\<\/.+/) ){
                // console.log('終了タグです。親の参照を一つ戻します。');
                // parent = null;
                index--;
                continue;
            }

            // 完了 : 'A/>' 要素を含む場合は親にならない
            if( classname.replace(/\s+/g,'').match(/.+\/\>/)){
                // console.log('完了タグです。親になりません');
                isParent = false;
            }

            // classname = classname.replace(/\>/g,'');

            //================================================
            // {{ value }} => this.props.value で上書き
            //================================================
            classname = this.convertClassnameToProps( classname );

            if(!classname)continue;

            // 文字列ではなく、オブジェクトが{{props}}経由で渡された場合
            if(typeof classname !== 'string' && typeof classname !== 'number'){
                if( parents[index].isCoreObject ) {
                    // console.log('core objectです')
                    parents[index].addObj( classname );
                }else{
                    // console.log('jquery object,あるいはテキストです')
                    parents[index].append( classname );
                }

                continue;
            }

            // オブジェクト以外のclassnameは stringとして扱う 999 => '999'
            classname = String( classname );

            //================================================
            // propsを取得
            // <A {message:'ほげ'} />
            //================================================
            let props = this.getProps( classname );

            // props 要素削除 
            classname = classname.replace(/\{.+\}/g,'');

            //================================================
            // オブジェクトを取得してpropsに追加
            // <A :child_props_key=parent_props_key />
            //================================================
            props = this.addObjectProps( props , classname );

            // オブジェクト要素を消す
            // classname = classname.replace(/\:.+/g,'');
            classname = classname.replace(/:\w+=\w+/g,'');

            //================================================
            // インスタンスの定義名称の取得
            // <A @name /> .. this.obj('name') で呼び出せる
            //================================================
            let name = this.getInstanceName( classname );

            // 名前要素を消す
            // classname = classname.replace(/@.+/g,'');
            classname = classname.replace(/\s+@\w+/g,'');


            //================================================
            // <A $class=classname />
            // attr
            //================================================
            let attr = this.getAttr( classname );
            classname = classname.replace(/\$\w+=[\w\W]+/g,'');

            //================================================
            // v-forの取得
            // <A v-for=["v in list"] ></A>
            //================================================
            this.updateVFor( index+1 , classname );
            classname = classname.replace(/v-for\s*=\s*\[(.+)\]/g,'');


            //================================================
            // クラス名から余分なものを削除
            //================================================
            // console.log( '取り除く前:' , classname );
            // classname = classname.replace(/<|>|\/|\s+/g,'');
            // classname = classname.replace(/<|>|\//g,'').replace(/^\s*|\s*$/g,'');
            classname = classname.replace(/<|>|<\s*\/|\/\s*>/g,'').replace(/^\s*|\s*$/g,'');
            // console.log( '最終クラス名:' , classname );

            // 最終的に何もない場合はスキップ
            if(!classname)continue;

            // テンプレート、あるいはHtmlTagの場合
            if( TEMP[classname] || this.isHtmlTag( classname ) ){
                // console.log('テンプレートです:', classname);
                

                let c;
                if( TEMP[classname] ) {
                    // テンプレート生成
                    c = new TEMP[classname]( props || {} );
                }
                else {
                    // コアオブジェクトクラス生成
                    // c = $c( classname );

                    // templateとして生成
                    c = new Template( classname );
                }

                // attr付与
                for(var key in attr ){
                    c.attr( key , attr[key]);
                }

                // 親がいるなら親に配置
                if( parents[index] ) {
                    // console.log('親に配置します 親のindex:' , index )
                    parents[index].addObj( c );
                }
                else {
                    // もしrootが指定されてるならそこに配置
                    if( rootname ){
                        // console.log('rootname:' + rootname + 'に配置:' , classname  )
                        this.obj(rootname).addObj( c );
                    }
                    else this.addObj( c );
                }

                // 親要素を更新
                if(isParent) {
                    // parents.push(c);
                    index++;
                    this.addParents( parents , index , c );
                    // console.log('親です myIndex:' , index );
                }

                // オブジェクトとして名前付きで保存
                if(name)this.objects[name] = c;
            }


            // ただの文字列の場合
            // <button>ぼたん</button>
            else{
                // console.log('ただの文字列を配置します:', classname);
                // console.log('親のindex:',index);
                if( parents[index] ) {
                    // console.log('親に配置します')
                    parents[index].append( classname );
                }
            }

            // console.log('配置後のindex:',index);

        }
    }

    /**
     * convertClassnameToProps v1
     * クラス名が {{ value }} の場合、this.props.value で書き換える
     */
    // convertClassnameToProps( classname ){
    //     let innerHtml = classname.match(/\{\{.+\}\}/g);
    //     console.log('innerHtml:',innerHtml)
    //     if( innerHtml ){
    //         // front {{ value }} back
    //         let frontString = classname.split( /\{\{.+\}\}/g )[0];
    //         let backString  = classname.split( /\{\{.+\}\}/g )[1];
    //         // console.log('innerHtml:' , innerHtml );
    //         innerHtml = innerHtml[0].replace(/\{\{|\}\}|\s+/g,'');
    //         console.log('innerHtml:' , innerHtml );

    //         if( this.vfor.variable && innerHtml == this.vfor.variable ){
    //             // classname = this.props[this.vfor.list][this.vfor.index];
    //             classname = this.vfor.list[this.vfor.index];
    //             this.vfor.index++;
    //         }
    //         // ネストした階層オブジェクト
    //         else if(innerHtml.match(/.+\..+/g)){
    //             classname = this.getNestValue( innerHtml );
    //         }
    //         else{
    //             classname = this.props[innerHtml];
    //         }

    //         if(typeof classname != 'object'){
    //             if(classname == undefined ){
    //                 classname = frontString + backString;
    //             }
    //             else classname = frontString + classname + backString;
    //         }
            
    //     }
    //     // console.log( classname );
    //     return classname;
    // }


    /**
     * convertClassnameToProps v2
     * クラス名が {{ value }} の場合、this.props.value で書き換える
     * メモ1. {{ value1 }} {{ value2 }} value1が文字列でvalue2がオブジェクトみたいなのには非対応
     * メモ2. <div>{{value1}}:{{value2}}</div> ならok
     * メモ3. <img $src={{value1}} $height={{value2}} /> ならok
     */
    convertClassnameToProps( classname ){
        // console.log( 'convertClassnameToProps classname:',classname );

        // const regex = /\{\{([^}]+)\}\}/g;
        const regex = /\{\{\s*([^}]+)\s*\}\}/g;
        let match;

        //{{key1}} {{key2}} の key1 key2を抜き出す
        while ((match = regex.exec(classname)) !== null) {

            let key  = match[1].replace(/\s+/g,'');//key1 スペースを消す
            // console.log('key:',key);
            
            let prop;
            if( this.vfor.variable && key == this.vfor.variable ){
                prop = this.vfor.list[this.vfor.index];
                this.vfor.index++;
            }
            // ネストした階層オブジェクト
            else if(key.match(/.+\..+/g)){
                prop = this.getNestValue( key );
            }
            else{
                prop = this.props[key];
            }

            // console.log('prop:',prop);

            // 文字列などの場合、{{ value }} を propで差し替え 
            if(typeof prop != 'object'){
                // console.log( 'prop:',prop );
                if( classname ){
                    let re = new RegExp( '{{\\s*' + key + '\\s*}}' , 'g');
                    classname = classname.replace( re , prop );

                    // console.log( 'replaced classname:',classname );
                }
            }

            // オブジェクトだったら、獲得したオブジェクトを返す
            else{
                classname = prop;
            }
        }

        // console.log( classname );

        return classname;
    }


    /**
     * props要素取得
     * <A {key:value} />
     */ 
    getProps(classname){
        let props = classname.match(/\{.+\}/g);
        if( props ){
            props = props[0];
            // console.log( 'props要素取得:' , props );

            let _props = {};
            //{aa:bb,cc:dd} = [aa:bb,cc:dd]
            let items = props.replace(/\{|\}/g,'').split(',');
            for( var i=0;i<items.length;i++ ){
                let item = items[i];
                let key   = item.split(':')[0].replace(/\s*/g,'');
                let value = item.split(':')[1];
                // bb
                let propskey = value.replace(/\s*/g,'');

                // console.log('value?:' , value.replace(/^\s*|\s*$/g,''));
                // console.log('number?:' , typeof value.replace(/^\s*|\s*$/g,''));

                // 文字列として与えられている '," がついてる
                if( value.match(/^'|^"/)){
                    // console.log('文字列です')
                    value = value.replace(/'|"/g,'').replace(/^\s*|\s*$/g,'');
                }
                // valueが obj.obj のようにネストしている場合
                else if(value.match(/.+\..+/g)){
                    // console.log('ネストした階層オブジェクトです')
                    value = this.getNestValue( propskey );
                }
                // propsに情報がある
                else if( this.props[propskey] !== undefined ){
                    value = this.props[propskey];
                }
                // 数値(Number化してもNaNにならない)
                else if( !isNaN( Number( value.replace(/^\s*|\s*$/g,'') ) ) ){
                    // console.log('数値です')
                    value = Number( value.replace(/^\s*|\s*$/g,'') )
                }
                // booleanである
                else if( value.replace(/^\s*|\s*$/g,'')=='true' || value.replace(/^\s*|\s*$/g,'')=='false'){
                    // console.log('booleanです:',value);
                    value = (value.replace(/^\s*|\s*$/g,'')=='true');
                    // console.log('booleanです:',value);
                }
                else{
                    value = undefined;
                }
                // if(typeof value == 'string')value = value.replace(/'|"/g,'').replace(/^\s*|\s*$/g,'');
                _props[key] = value;

                // console.log('key:',key)
                // console.log('value:',value)
            }
            // console.log( _props );
    
            // オブジェクト化
            // props = this.strToObj( props );

            return _props;
        }

        return null;
    }

    /**
     * インスタンス名取得
     * <A @name />
     */
    getInstanceName( classname ){
        let name = classname.match(/\s+@\w+/g);
        if( name ){
            // 名前だけ抽出
            name = name[0].replace(/\@|\/|\s+/g,'');
            return name;
        }
        return null;
    }

    /**
     * v-for要素を取得して保持データを更新
     */
    updateVFor( index , classname ){
        let vfor = classname.match( /v-for\s*=\s*\[(.+)\]/ );
        if(vfor){
            // index .. 参照する親index
            // this.vfors[index] = [];
            // let items = vfor[1].split(',');
            // for(var i=0;i<items.length;i++){
            //     let variable = items[i].split('in')[0].replace(/\"|\s+/g,'');
            //     let list     = items[i].split('in')[1].replace(/\"|\s+/g,'');

            //     console.log('variable:' , variable );
            //     console.log('list:' , list );
            //     this.vfors[index].push({
            //         variable : variable,
            //         list     : list,
            //     });

            //     // 繰り返し回数
            //     this.vforNum = this.props[list].length;
            // }
            // // 親のindex
            // this.vforParentIndex = index;

            let variable = vfor[1].split('in')[0].replace(/\"|\s+/g,'');
            let list     = vfor[1].split('in')[1].replace(/\"|\s+/g,'');

            this.vfor = {
                variable : variable,
                list : this.props[list],
                index: 0,
            };

            // console.log('create vfor :' , this.vfor );

            // this.vforNum = this.props[list].length;

            // 繰り返し表示のindex
            // this.vforIndex = 0;

            // 親要素の名前
            this.vforParentname = this.getInstanceName( classname ) || 'parent';

            // タグ保持
            this.vforTag = classname.replace(/v-for\s*=\s*\[(.+)\]/g,'').replace(/<|>|\/|\s+/g,'');
            // console.log( 'this.vforTag :' , this.vforTag);
        }
    }

    // 親要素を追加
    addParents( parents , index , object ){
        // 上書き
        if(parents[index]){
            parents[index] = object;
        }
        else{
            parents.push( object );
        }
    }

    // htmlTag
    isHtmlTag( str ){
        let list = ['div','input','span','p','br','button','h1','h2','h3','img','hr','option','ul','li','form','canvas'];
        return list.includes(str);
    }

    /**
     * オブジェクトが含まれている場合
     *  子に引き渡すpropsに付与する
     * <A :child_props_key=parent_props_key />
     * props[prop] = this.props[objectkey]
     */
    addObjectProps( props , classname ){
        // console.log('classname:',classname)

        if( !classname.match(/\:\w+=\w+/g) ){
            // console.log('マッチしません');
            return props;
        }

        let items = classname.split(/\:/g);

        // console.log( 'items:',items );

        for( var i=0; i<items.length; i++){
  
            let item = items[i].replace(/<|>|\/|\s+/g,'');

            let child_props_key  = item.split('=')[0];
            let parent_props_key = item.split('=')[1];

            // console.log('child_props_key:',child_props_key);
            // console.log('parent_props_key:',parent_props_key);

            if( this.vfor.variable && parent_props_key == this.vfor.variable ){
                if(!props)props ={};
                // props[child_props_key] = this.props[this.vfor.list][this.vfor.index];
                props[child_props_key] = this.vfor.list[this.vfor.index];
                this.vfor.index++;
                continue;
            }
  
            // propsの中に該当するオブジェクトが存在する場合は引き渡す
            if( this.props[parent_props_key] ){
                if(!props)props ={};
                props[child_props_key] = this.props[parent_props_key];
            }                    
        }
        return props;
    }

    /**
     * class や style といった attributeを取得
     * <A $attr_key=attr_value />
     */
    getAttr( classname ){

        if( !classname.match(/\$\w+=\w+/g) ){
            // console.log('attr マッチしません');
            return {};
        }
        // console.log('attr マッチします classname:' , classname );

        let attr = {};
        let items = classname.split(/\$/g);
        for( var i=1; i<items.length; i++){
  
            // let item = items[i].replace(/<|>|\/|\s+|\$/g,'');
            // '/'は末尾だけ消す。img/icon/xx.pngみたいなのがあるので
            let item = items[i].replace(/<|>|\s+|\$/g,'').replace(/\/$/,'');

            let attr_key   = item.split('=')[0];
            let attr_value = item.split('=')[1];

            // console.log('attr_key:',attr_key);
            // console.log('attr_value:',attr_value);
  
            attr[attr_key] = attr_value;                               
        }
        return attr;
    }

    // 文字列をオブジェクトに変換
    strToObj( str ){
        return Function('return (' + str +');')();
    }

    // 配置したオブジェクトを名前から取得
    obj( key ){
        key = key.replace(/^@/g,'');
        if( !this.objects[key] ){
            console.log('key:' + key + 'のオブジェクトは存在していません' )
            // console.log('かえす');
            return { tap:()=>{}};// objectが存在してない場合のエラー回避用
        }
        return this.objects[key];
    }

    // オブジェクトを登録
    registerObj( key , obj ){
        this.objects[key] = obj ;
    }

    // ネストしているvalueの取得
    // objA.objB.objC
    getNestValue( nestString ){
        let items = nestString.split('.');
        let root = this.props;
        for(var i=0;i<items.length;i++){
            let key = items[i].replace(/\s+/g,'');
            try{
                root = root[key];
            }catch(e){
                break;
                root = undefined;
            }
            
        }
        return root;
    }
}



