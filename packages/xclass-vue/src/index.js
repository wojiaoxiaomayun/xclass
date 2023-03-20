import XClass from "@xnocss/core";

const vueXclass = {
    install(app, options = {
        presets:[],
        rules:[],
        pseudoClassDefine:{},
        responsiveDefine:{},
        shortDefine:{},
        themes:{},
        cacheExpire:-1,
        version:'1.0.0',
        debug:false,
        clearCache:true,
        initialRenderNum:1000
    }) {
        let rules = Object.assign(options?.presets?.map(preset=> preset.rules || [])?.reduce((prev,curt) => {
            prev.push(...curt)
            return prev;
        },[]) || [],options?.rules || []);
        let pseudoClassDefine = Object.assign(options?.presets?.map(preset=> preset.pseudoClassDefine || {})?.reduce((prev,curt) => {
            Object.assign(prev,curt)
            return prev;
        },{}) || {},options?.pseudoClassDefine || {});
        let responsiveDefine = Object.assign(options?.presets?.map(preset=> preset.responsiveDefine || {})?.reduce((prev,curt) => {
            Object.assign(prev,curt)
            return prev;
        },{}) || {},options?.responsiveDefine || {});
        let shortDefine = Object.assign(options?.presets?.map(preset=> preset.shortDefine || {})?.reduce((prev,curt) => {
            Object.assign(prev,curt)
            return prev;
        },{}) || {},options?.shortDefine || {});
        let themes = Object.assign(options?.presets?.map(preset=> preset.themes || {})?.reduce((prev,curt) => {
            Object.assign(prev,curt)
            return prev;
        },{}) || {},options?.themes || {});
        let xclass = new XClass({
            rules,
            pseudoClassDefine,
            responsiveDefine,
            shortDefine,
            themes,
            cacheExpire:options?.runtime?.cacheExpire,
            version:options?.runtime?.version,
            debug:options?.runtime?.debug,
            clearCache:options?.runtime?.clearCache,
            initialRenderNum:options?.runtime?.initialRenderNum
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