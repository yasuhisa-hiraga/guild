/**
 * トップページ
 */
class TopPage extends Page{
    constructor(){
        super('topPage');

        this.css({
            'background-color': 'black',
            'color':'white',
        })
    }

    render(){
        super.render();
        this.addObj( new TopUnit() );
    }
}

class TopUnit extends Template{
    constructor(){
        super();
        this.addClass('topPage-unit');
    }
    render(){
        super.render();
        this.template(`
            <Sample {label:'トップページ'} />
            <button @btn >マイページへ</button>
        `);

        this.obj('btn').tap(()=>{
            PAGE.goto('myPage');
        });
    }
}
