import XClass from "xclass-core";
const createXclass = (options = {
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
}) => {
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
    document.addEventListener('DOMNodeInserted',function(arg){
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
export default createXclass;
