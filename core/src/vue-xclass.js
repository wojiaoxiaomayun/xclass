import XClass from "./core";
import { rules,colors,pseudoClassDefine } from "./rule";

const vueXclass = {
    install(app, options) {
        let xclass = new XClass({
            rules,colors,pseudoClassDefine
        })
        if(options){
            if(options.colors){
                Object.keys(options.colors).forEach(key => {
                    xclass.colors[key] = options.colors[key]
                })
            }
            if(options.rules){
                if(options.ruleNew){
                    xclass.rules = options.rules
                }else{
                    xclass.rules.push(...options.rules)
                }
            }
            if(options.cacheExpire){
                xclass.cacheExpire = options.cacheExpire;
            }
            if(options.version){
                xclass.version = options.version;
            }
            xclass.debug = options.debug || false;
            if(options.clearCache){
                xclass.isClearCache = options.clearCache;
            }
            if(options.pseudoClassDefine){
                Object.keys(options.pseudoClassDefine).forEach(key => {
                    xclass.pseudoClassDefine[key] = options.pseudoClassDefine[key]
                })
            }
        }
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