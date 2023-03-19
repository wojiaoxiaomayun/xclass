class XClass {
    title = 'XCLASS';
    version = '1.0.0';
    isClearCache = true;
    cacheExpire = -1;
    pseudoClassDefine = {};
    responsiveDefine = {};
    shortDefine = {};
    rules = [];
    themes = {};
    initialRenderNum = 1000;
    debug = false;


    #debugMap = new Map();
    #debugResultMap = new Map();
    #observeMap = new Map();
    #interSectionObserver = null;
    #styleMap = new Map();
    #styleSheet = null;
    #styleCache = {};
    #elBindingMap = new Map();


    constructor(options = {}) {
        this.title = options?.title ?? 'XCLASS'
        this.version = options?.version ?? '1.0.0'
        this.isClearCache = options?.isClearCache ?? true
        this.cacheExpire = options?.cacheExpire ?? -1
        this.pseudoClassDefine = options?.pseudoClassDefine ?? {}
        this.responsiveDefine = options?.responsiveDefine ?? {}
        this.shortDefine = options?.shortDefine ?? {}
        this.themes = options?.themes ?? {}
        this.rules = options?.rules ?? []
        this.initialRenderNum = options?.initialRenderNum || 1000
        this.debug = options?.debug ?? false
        if(typeof window == 'object'){
            this.init()
        }
    }

    init() {
        let cacheKey = this.title + '_' + this.version;
        if (this.isClearCache) {
            XClass.removeStorages(new RegExp(`${this.title}_.*`))
        } else {
            XClass.removeStorages(new RegExp(`${this.title}_.*`), [cacheKey])
        }
        const _historyWrap = function (type) {
            const orig = history[type];
            const e = new Event(type);
            return function () {
                const rv = orig.apply(this, arguments);
                e.arguments = arguments;
                window.dispatchEvent(e);
                return rv;
            };
        };
        history.pushState = _historyWrap('pushState');
        history.replaceState = _historyWrap('replaceState');
        window.addEventListener("hashchange", () => {
            this.#elBindingMap.clear();
        });
        window.addEventListener('popstate', () =>  {
            this.#elBindingMap.clear();
        })
        window.addEventListener('pushState', () =>  {
            this.#elBindingMap.clear();
        });
        window.addEventListener('replaceState', () =>  {
            this.#elBindingMap.clear();
        });
        let cache = XClass.getStorage(cacheKey) || {}
        this.#styleCache = new Proxy(cache, {
            get(target, key) {
                return target[key]
            },
            set(target, key, value) {
                target[key] = value
                XClass.setStorage(cacheKey, cache, this.cacheExpire)
                return true;
            }
        })
        let doms = document.querySelectorAll(`style[title=${this.title}]`)
        if (doms.length == 0) {
            let style = document.createElement('style');
            style.type = 'text/css'
            style.title = this.title
            // style.innerHTML = styleText
            let headNode = document.querySelector('head');
            headNode.appendChild(style)
        }
        let sheets = document.styleSheets;
        for (let i = sheets.length - 1; i >= 0; i--) {
            let sheet = sheets.item(i);
            if (sheet.title == this.title) {
                this.#styleSheet = sheet;
            }
        }
        //加入视窗监视器，来保证进入视窗的元素才被渲染，大大降低了js使用率，成功避免渲染10000及更多节点卡死问题
        this.#interSectionObserver = new IntersectionObserver(this.intersectionCallback, {
            rootMargin: '500px 0px'
        })
    }

    intersectionCallback = (entries) => {
        entries.forEach(entry => {
            let el = entry.target
            if (entry.isIntersecting) {
                this.initNode(el)
                this.#interSectionObserver.unobserve(el)
            }
        })
    }

    bind(el, binding) {
        this.#elBindingMap.set(el, binding)
        //拥有uid，已经渲染过，直接进入节点进行监听变化即可
        if(el.getAttribute('uid')){
            this.initNode(el)
            return;
        }
        if (this.#elBindingMap.size > this.initialRenderNum) {
            if (binding?.modifiers?.real || XClass.isInViewPort(el)) {
                this.initNode(el)
            } else {
                this.#interSectionObserver.observe(el)
            }
        } else {
            this.initNode(el)
        }
    }

    unbind(el) {
        let _uid = el.getAttribute('uid')
        if (this.#observeMap.get(_uid)) {
            this.#observeMap.get(_uid).disconnect();
            this.#observeMap.delete(_uid)
        }
    }

    initNode(el) {
        let _uid = el.getAttribute('uid');
        if(_uid){
            console.log('插件生成',_uid)
        }
        if(!_uid){
            _uid = `${this.title}-${XClass.guid()}`;
            let attr = document.createAttribute('uid');
            attr.nodeValue = _uid
            el.attributes.setNamedItem(attr)
            // el.classList.add(this.class);
            this.handleDebug(this.#elBindingMap.get(el), _uid)
            let startTime = new Date().getTime();
            this.parseAndCreate(el)
            if (this.debug) {
                console.log('生成时间', _uid, new Date().getTime() - startTime)
            }
        }
        var observerOptions = {
            childList: false,  // 观察目标子节点的变化，是否有添加或者删除
            attributes: true, // 观察属性变动
            subtree: false     // 观察后代节点，默认为 false
        }
        let observer = new MutationObserver(() => {
            let startTime1 = new Date().getTime();
            this.parseAndCreate(el)
            if (this.debug) {
                console.log('生成时间-', _uid, new Date().getTime() - startTime1)
            }
        });
        observer.observe(el, observerOptions);
        this.#observeMap.set(_uid, observer)
    }
    parseAndCreate(el){
        let styles = this.parseStyle(el)
        this.createStyles(styles, el)
    }
    // 解析style结果
    parseStyle(el) {
        let attrs = el.attributes;
        let attrNames = []
        let classList = el.classList
        classList.forEach(item => {
            attrNames.push(item)
        })
        for (let i = 0; i < attrs.length; i++) {
            attrNames.push(attrs[i].nodeName)
        }
        let _uid = el.getAttribute('uid')
        let arr = this.#styleMap.get(_uid)
        if (arr && arr.length == attrNames.length) {
            if (arr.filter(e => !attrNames.includes(e)).length == 0) {
                return {}
            }
        }
        this.#styleMap.set(_uid, attrNames.map(e => e))
        return this.parseStyleNode(attrNames,_uid)
    }
    //将结果挂载到stylesheet上
    createStyles(responsiveResult, el) {
        let results = this.createStylesNode(responsiveResult,el.getAttribute('uid'),el.tagName.toLocaleLowerCase())
        results.forEach(result => {
            result.forEach(styleResult => {
                this.insertStyle(styleResult.selector, styleResult.styleText, styleResult.newStyleText)
            })
        })
        this.debugConsole(el)
    }
    //插入stylesheet的
    insertStyle(selector, styleText, newStyleText) {
        let sheet = this.#styleSheet;
        if (sheet.title == this.title) {
            let cssRules = sheet.cssRules;
            let flag = true;
            for (let j = 0; j < cssRules.length; j++) {
                let cssRule = cssRules.item(j);
                if (!newStyleText && cssRule.type == 1) {
                    if (cssRule.selectorText == selector && cssRule.cssText != styleText) {
                        XClass.deleteRule(sheet, j)
                        XClass.insertRule(sheet, selector, styleText, j)
                        flag = false
                        break;
                    }
                } else if (newStyleText && cssRule.type == 4) {
                    for (let k = 0; k < cssRule.cssRules.length; k++) {
                        let innerCssRule = cssRule.cssRules.item(k);
                        if (innerCssRule.selectorText == selector && innerCssRule.cssText != styleText) {
                            XClass.deleteRule(sheet, j)
                            XClass.insertRule(sheet, selector, newStyleText, j)
                            flag = false
                            break;
                        }
                    }
                    if (!flag) {
                        break;
                    }
                }
            }
            if (flag) {
                // doms[0].append(styleText)
                XClass.insertRule(sheet, selector, newStyleText || styleText, 0)
            }
        }
    }
    // 将得到的class或者attr解析成style
    //先处理响应式的东西，然后交给#parseStyleResultNode来统一处理style结果
    parseStyleNode(attrNames,_uid){
        let newAttrNames = []
        attrNames.forEach((name, index) => {
            if (Object.keys(this.shortDefine).includes(name)) {
                attrNames.splice(index, 1, '')
                let shortArr = this.shortDefine[name] || []
                if (typeof shortArr == 'string') {
                    shortArr = shortArr.split(' ')
                }
                newAttrNames.push(...shortArr)
            }
        });
        attrNames = attrNames.filter(e => e);
        attrNames.push(...newAttrNames)
        let responsiveResult = {}
        if (Object.keys(this.responsiveDefine).length > 0) {
            Object.keys(this.responsiveDefine).forEach(responsiveDefineKey => {
                if (!responsiveResult[this.responsiveDefine[responsiveDefineKey]]) {
                    responsiveResult[this.responsiveDefine[responsiveDefineKey]] = []
                }
                attrNames = attrNames.filter(e => e);
                responsiveResult[this.responsiveDefine[responsiveDefineKey]].push(this.#parseStyleResultNode(
                    attrNames.filter((attr, index) => {
                        let status = attr.startsWith(responsiveDefineKey);
                        if (status) {
                            attrNames.splice(index, 1, '')
                        }
                        return status;
                    }).map(name => {
                        let key = name.replace(responsiveDefineKey, '')
                        return key;
                    }),
                    _uid
                ));
            })
            attrNames = attrNames.filter(e => e);
            responsiveResult[''] = [this.#parseStyleResultNode(attrNames,_uid)];
        } else {
            responsiveResult[''] = [this.#parseStyleResultNode(attrNames,_uid)];
        }
        return responsiveResult;
    }

    #parseStyleResultNode(attrNames,_uid) {
        let result = {}
        let allStyleCache = attrNames.map((name, index) => {
            let cache = this.#styleCache[name]
            if (cache) {
                this.debugCollect(_uid, function (value) {
                    if (value.length == 0) {
                        return ['规则生成缓存', name, cache]
                    } else {
                        if (value.includes(name)) {
                            return ['规则生成缓存', name, cache]
                        }
                    }
                })
                attrNames.splice(index, 1, '')
            }
            return cache;
        }).filter(e => e)
        //排除有缓存的key
        Object.keys(this.pseudoClassDefine).forEach(pseudoClassDefineKey => {
            if (!result[this.pseudoClassDefine[pseudoClassDefineKey]]) {
                result[this.pseudoClassDefine[pseudoClassDefineKey]] = []
            }
            attrNames = attrNames.filter(e => e)
            let pseudoClassDefineStyles = attrNames.filter((name, index) => {
                let status = name.startsWith(pseudoClassDefineKey);
                if (status) {
                    attrNames.splice(index, 1, '')
                }
                return status;
            }).map(name => {
                let key = name.replace(pseudoClassDefineKey, '')
                let style = this.#styleCache[key];
                if (style) {
                    this.debugCollect(_uid, function (value) {
                        if (value.length == 0) {
                            return ['规则生成-缓存', name, style]
                        } else {
                            if (value.includes(name)) {
                                return ['规则生成-缓存', name, style]
                            }
                        }
                    })
                    return [style]
                }
                return this.rules.filter(rule => {
                    return rule[0].test(key)
                }).map(rule => {
                    style = rule[1](rule[0].exec(key), key,this.themes);
                    this.#styleCache[key] = style;
                    this.debugCollect(_uid, function (value) {
                        if (value.length == 0) {
                            return ['规则生成', rule[0], name, style]
                        } else {
                            if (value.includes(name)) {
                                return ['规则生成', rule[0], name, style]
                            }
                        }
                    })
                    return style;
                })
            }).flat(Infinity)
            result[this.pseudoClassDefine[pseudoClassDefineKey]].push(...pseudoClassDefineStyles)
        })
        // 再次排除
        attrNames = attrNames.filter(e => e);
        let allStyles = this.rules.map(rule => {
            let styles = attrNames.filter(e => {
                return rule[0].test(e)
            }).map(name => {
                let style = rule[1](rule[0].exec(name),name,this.themes);
                this.#styleCache[name] = style;
                this.debugCollect(_uid, function (value) {
                    if (value.length == 0) {
                        return ['规则生成', rule[0], name, style]
                    } else {
                        if (value.includes(name)) {
                            return ['规则生成', rule[0], name, style]
                        }
                    }
                })
                return style;
            })
            return styles
        }).flat(Infinity)
        result[''] = allStyleCache.concat(allStyles);
        return result;
    }
    //生成单个css结果
    createStyleNode(styles, _uid,tagName, pseudoClassDefineStr = '') {
        let styleText = (styles?.length ?? 0) > 0 ? `
                ${tagName.toLocaleLowerCase()}[uid="${_uid}"]${pseudoClassDefineStr}{
                    ${styles.join('')}
                }
            `: ''
        return styleText?{
            styleText
        }:undefined
    }
    //生成所有的css并返回生成对象
    createStylesNode(responsiveResult,_uid,tagName) {
        if (responsiveResult) {
            return Object.keys(responsiveResult).map(key => {
                //响应式集合数据
                let responsiveArr = responsiveResult[key]
                //合并响应式集合内的数据
                let result = responsiveArr.reduce((prev, curt) => {
                    Object.keys(curt).forEach(innerKey => {
                        if (!prev[innerKey]) {
                            prev[innerKey] = []
                        }
                        prev[innerKey].push(...curt[innerKey])
                    })
                    return prev
                }, {})
                return Object.keys(result).map(pseudoClassDefineStr => {
                    try {
                        let styleResult = this.createStyleNode(result[pseudoClassDefineStr], _uid,tagName, pseudoClassDefineStr || '')
                        if (styleResult) {
                            if (key) {
                                styleResult['newStyleText'] = key + `{${styleResult.styleText}}`
                            }
                            return styleResult;
                        }
                    } catch (ex) {
                        console.error(ex)
                    }
                    return undefined;
                }).filter(e => e)
            }).filter(e => e.length > 0)
        }
        return []
    }


    handleDebug(binding, _uid) {
        if (this.debug) {
            if (binding.arg == 'test') {
                let value = binding.value || [];
                if (typeof value == 'string') {
                    value = value.split(' ')
                }
                this.#debugMap.set(_uid, value || [])
            } else {
                this.#debugMap.delete(_uid)
            }
        }
    }

    debugCollect(_uid, callback) {
        if (this.debug) {
            if (this.#debugMap.get(_uid)) {
                let value = this.#debugMap.get(_uid) || []
                if (callback) {
                    let result = callback(value)
                    if (!this.#debugResultMap.get(_uid)) {
                        this.#debugResultMap.set(_uid, [])
                    }
                    if (result) {
                        this.#debugResultMap.get(_uid).push(result)
                    }
                }
            }

        }
    }

    debugConsole(el) {
        if (this.debug) {
            let _uid = el.getAttribute('uid')
            if (this.#debugMap.get(_uid)) {
                console.log('测试结果', _uid, el)
                console.log(this.#debugResultMap.get(_uid))
            }
        }

    }

    static insertRule(sheet, selectorText, cssText, position) {
        if (sheet.insertRule && cssText) {
            sheet.insertRule(cssText, position);
        }
        else
            if (sheet.addRule && cssText) { //仅对IE有效
                sheet.addRule(selectorText, cssText, position);
            }
    }

    static deleteRule(sheet, index) {
        if (sheet.deleteRule) {
            sheet.deleteRule(index);
        }
        else
            if (sheet.removeRule) { //仅对IE有效
                sheet.removeRule(index);
            }
    }

    static guid = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    static setStorage = (key, value, expire = 7200000) => {
        let data = {
            value: value,
            expire: expire,
            timestamp: Date.now(),
            isForever: expire == -1
        }
        window.localStorage.setItem(key, JSON.stringify(data))
    }

    static getStorage = key => {
        let value = window.localStorage.getItem(key)
        if (!value) {
            return null
        }
        let data = JSON.parse(value)
        if (!data.isForever && Date.now() > data.expire + data.timestamp) {
            window.localStorage.removeItem(key)
            return null
        } else {
            return data.value
        }
    }

    static removeStorage = key => {
        window.localStorage.removeItem(key)
    }

    static removeStorages = (regx, exclude = []) => {
        Object.keys(window.localStorage).filter(e => {
            return regx.test(e) && !exclude.includes(e)
        }).forEach(key => {
            window.localStorage.removeItem(key)
        })
    }

    static isInViewPort = (element) => {
        const viewWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;
        const {
            top,
            right,
            bottom,
            left,
        } = element.getBoundingClientRect();
        return (
            top >= 0 &&
            left >= 0 &&
            right <= viewWidth &&
            bottom <= viewHeight
        );
    }
}

export default XClass;