/**
 * マイページ
 */
class MyPage extends Page{
    constructor(){
        super('myPage');

        this.css({
            'background-color': 'white',
            'color':'black',
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
            <button @btn >トップページへ</button>
        `);

        this.obj('btn').tap(()=>{
            PAGE.goto('topPage');
        });
    }
}
