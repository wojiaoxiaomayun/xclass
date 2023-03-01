import XClass from "@xclass/core";
import {rules,colors,pseudoClassDefine} from "@xclass/core"
const XClassAll = (options = {}) => {
    if(options){
        if(options.colors){
            Object.keys(options.colors).forEach(key => {
                colors[key] = options.colors[key]
            })
        }
        if(options.rules){
            if(options.ruleNew){
                rules = options.rules
            }else{
                rules.push(...options.rules)
            }
        }
        if(options.pseudoClassDefine){
            Object.keys(options.pseudoClassDefine).forEach(key => {
                pseudoClassDefine[key] = options.pseudoClassDefine[key]
            })
        }
    }
    let xclass = new XClass({
        rules,
        colors,
        pseudoClassDefine,
        renderDomNum:options.renderDomNum,
        cacheExpire:options.cacheExpire,
        version:options.version,
        debug:options.debug,
        clearCache:options.clearCache
    })
    document.body.addEventListener('DOMNodeInserted',function(arg){
        if(arg?.target?.attributes && arg?.target?.attributes?.getNamedItem('x-class')){
            xclass.bind(arg.target,{})
        }
    })
}
export default XClassAll;