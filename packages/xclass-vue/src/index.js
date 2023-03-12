import XClass from "xclass-core";
import { rules,colors,pseudoClassDefine,responsiveDefine } from "xclass-core";

const vueXclass = {
    install(app, options = {}) {
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
            clearCache:options.clearCache,
            initialRenderNum:options.initialRenderNum
        })
        if(app.version[0] == 3){
            app.directive('xclass', {
                mounted(el, binding, vnode, prevVnode) {
                    xclass.bind(el,binding)
                },
                unmounted(el, binding, vnode, prevVnode) {
                    xclass.unbind(el)
                }
            })
        }else{
            app.directive('xclass', {
                inserted(el, binding, vnode, prevVnode) {
                    xclass.bind(el,binding)
                },
                unbind(el, binding, vnode, prevVnode) {
                    xclass.unbind(el)
                }
            })
        }
    }
}

export default vueXclass;