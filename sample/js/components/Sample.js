//================================================
// サンプル
//================================================
class Sample extends Template{
    constructor( props ){
        super('div',{
            label:'テスト',
        });

        this.setprops( props );
        this.addClass('sample');
    }
    render(){
        super.render();

        this.template(`
            <div>{{label}}</div>
        `);
    }
}

TEMP['Sample'] = Sample;