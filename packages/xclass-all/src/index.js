import XClass from "@xnocss/core";

const createXclass = (options = {
    presets: [],
    rules: [],
    pseudoClassDefine: {},
    responsiveDefine: {},
    shortDefine: {},
    themes: {},
    cacheExpire: -1,
    version: '1.0.0',
    debug: false,
    clearCache: true,
    initialRenderNum: 1000
}) => {
    let rules = Object.assign(options?.presets?.map(preset => preset.rules || [])?.reduce((prev, curt) => {
        prev.push(...curt)
        return prev;
    }, []) || [], options?.rules || []);
    let pseudoClassDefine = Object.assign(options?.presets?.map(preset => preset.pseudoClassDefine || {})?.reduce((prev, curt) => {
        Object.assign(prev, curt)
        return prev;
    }, {}) || {}, options?.pseudoClassDefine || {});
    let responsiveDefine = Object.assign(options?.presets?.map(preset => preset.responsiveDefine || {})?.reduce((prev, curt) => {
        Object.assign(prev, curt)
        return prev;
    }, {}) || {}, options?.responsiveDefine || {});
    let shortDefine = Object.assign(options?.presets?.map(preset => preset.shortDefine || {})?.reduce((prev, curt) => {
        Object.assign(prev, curt)
        return prev;
    }, {}) || {}, options?.shortDefine || {});
    let themes = Object.assign(options?.presets?.map(preset => preset.themes || {})?.reduce((prev, curt) => {
        Object.assign(prev, curt)
        return prev;
    }, {}) || {}, options?.themes || {});
    let xclass = new XClass({
        rules,
        pseudoClassDefine,
        responsiveDefine,
        shortDefine,
        themes,
        cacheExpire: options?.runtime?.cacheExpire,
        version: options?.runtime?.version,
        debug: options?.runtime?.debug,
        clearCache: options?.runtime?.clearCache,
        initialRenderNum: options?.runtime?.initialRenderNum
    })
    function initTarget(target) {
        if (!target || target.nodeType != 1) {
            return;
        }
        if (
            target.hasAttribute('xclass') || target.hasAttribute('xclass:test') || target.hasAttribute('xclass:test.real') ||
            target.hasAttribute('v-xclass') || target.hasAttribute('v-xclass:test') || target.hasAttribute('v-xclass:test.real')
        ) {
            let attr = target?.attributes?.getNamedItem('xclass') || 
                        target?.attributes?.getNamedItem('xclass:test') || 
                        target?.attributes?.getNamedItem('xclass:test.real') || 
                        target?.attributes?.getNamedItem('v-xclass') || 
                        target?.attributes?.getNamedItem('v-xclass:test') || 
                        target?.attributes?.getNamedItem('v-xclass:test.real');
            let value = attr.value ? eval('(' + attr.value + ')') : ''
            xclass.bind(target, {
                arg: attr.name.includes('test') ? 'test' : '',
                value: attr.name.includes('test') ? value : '',
                modifiers: {
                    real: attr.name.includes('real')
                }
            })
        }
        let childs = Array.from(target.children)
        childs.forEach(e => {
            initTarget(e)
        })
    }
    document.addEventListener('DOMNodeInserted', function (arg) {
        initTarget(arg?.target)
    })
}
export default createXclass;
