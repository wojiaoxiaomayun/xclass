import XClass from "@xclass/core";
import { rules,colors,pseudoClassDefine } from "@xclass/core";

const vueXclass = {
    install(app, options) {
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
            if(options.responsiveDefine){
                Object.keys(options.responsiveDefine).forEach(key => {
                    responsiveDefine[key] = options.responsiveDefine[key]
                })
            }
        }
        let xclass = new XClass({
            rules,
            colors,
            pseudoClassDefine,
            responsiveDefine,
            shortDefine:options.shortDefine,
            renderDomNum:options.renderDomNum,
            cacheExpire:options.cacheExpire,
            version:options.version,
            debug:options.debug,
            clearCache:options.clearCache
        })
        if(app.version[0] == 3){
            app.directive('xclass', {
                beforeMount(el, binding, vnode, prevVnode) {
                    xclass.bind(el,binding)
                },
                beforeUnmount(el, binding, vnode, prevVnode) {
                    xclass.unbind(el)
                }
            })
        }else{
            app.directive('xclass', {
                bind(el, binding, vnode, prevVnode) {
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