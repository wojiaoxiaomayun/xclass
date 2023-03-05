import XClass from "@xclass/core";
import {rules,colors,pseudoClassDefine,responsiveDefine} from "@xclass/core"
const XClassAll = (options = {}) => {
    let newRUles = rules;
    if(options){
        if(options.colors){
            Object.keys(options.colors).forEach(key => {
                colors[key] = options.colors[key]
            })
        }
        if(options.rules){
            if(options.ruleNew){
                newRUles = options.rules
            }else{
                newRUles.push(...options.rules)
            }
        }
        if(options.pseudoClassDefine){
            Object.keys(options.pseudoClassDefine).forEach(key => {
                pseudoClassDefine[key] = options.pseudoClassDefine[key]
            })
        }
        if(options.responsiveDefine){
            Object.keys(options.responsiveDefine).forEach(key => {
                responsiveDefine[key] = options.responsiveDefine[key]
            })
        }
    }
    let xclass = new XClass({
        rules:newRUles,
        colors,
        pseudoClassDefine,
        responsiveDefine,
        shortDefine:options.shortDefine,
        cacheExpire:options.cacheExpire,
        version:options.version,
        debug:options.debug,
        clearCache:options.clearCache
    })
    document.body.addEventListener('DOMNodeInserted',function(arg){
        let attr = arg?.target?.attributes?.getNamedItem('xclass') || arg?.target?.attributes?.getNamedItem('xclass:test') || arg?.target?.attributes?.getNamedItem('xclass:test.real')
        if(attr){
            let value = attr.value?eval('(' + attr.value + ')'):''
            xclass.bind(arg.target,{
                arg:attr.name.includes('test')?'test':'',
                value:attr.name.includes('test')?value:'',
                modifiers:{
                    real:attr.name.includes('real')
                }
            })
        }
    })
}
export default XClassAll;