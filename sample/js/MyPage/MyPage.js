/**
 * マイページ
 */
class MyPage extends Page{
    constructor(){
        super('myPage');

        this.css({
            'background-size': 'cover',//'contain',//'cover',
            'background-position': 'center center',
            'background-color': '#999',

            'color':'white',
        });
    }

    render(){
        super.render();
        this.addObj( new MyUnit() );
    }
}

class MyUnit extends Template{
    constructor(){
        super();
        this.addClass('myPage-unit');
    }
    render(){
        super.render();
        this.template(`
            <Sample {label:'マイページ'} />
            <button @btn >トップへ戻る</button>
        `);

        this.obj('btn').tap(()=>{
            PAGE.goto('topPage');
        });
    }
}
