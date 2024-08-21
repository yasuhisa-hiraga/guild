/**
 * トップページ
 */
class TopPage extends Page{
    constructor(){
        super('topPage');

        this.css({
            'background-size': 'cover',//'contain',//'cover',
            'background-position': 'center center',
            'background-color': '#aaa',

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
            <button @btn >ページ遷移</button>
        `);

        this.obj('btn').tap(()=>{
            PAGE.goto('myPage');
        });
    }
}
