import XClass from "@xclass/core";
import {rules,colors,pseudoClassDefine} from "@xclass/core"
const XClassAll = () => {
    let xclass = new XClass({
        rules,colors,pseudoClassDefine
    })
    document.body.addEventListener('DOMNodeInserted',function(arg){
        if(arg?.target?.attributes && arg?.target?.attributes?.getNamedItem('x-class')){
            xclass.bind(arg.target,{})
        }
    })
}
export default XClassAll;