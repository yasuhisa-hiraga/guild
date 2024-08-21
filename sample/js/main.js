window.onload = function(){
    pageSetting();

    // タッチエフェクト開始
    GUI.enableBodyTouchEffect();
};


const PAGE   = new PageController();


//================================================
// ページ設定
//================================================
function pageSetting(){

    //================================================
    // コントローラーにページを登録
    //================================================
    PAGE.add( new TopPage() );
    PAGE.add( new MyPage() );

    // 指定のページへ遷移
    PAGE.goto( 'topPage' );

}