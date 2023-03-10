class XClass {
    title = 'XCLASS';
    version = '1.0.0';
    isClearCache = true;
    cacheExpire = -1;
    pseudoClassDefine = {};
    responsiveDefine = {};
    shortDefine = {};
    rules = [];
    colors = {};
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
        this.rules = options?.rules ?? []
        this.colors = options?.colors ?? {}
        this.initialRenderNum = options?.initialRenderNum || 1000
        this.debug = options?.debug ?? false
        this.init()
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
        //????????????????????????????????????????????????????????????????????????????????????js??????????????????????????????10000???????????????????????????
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
        let _uid = `${this.title}-${XClass.guid()}`;
        let attr = document.createAttribute('uid');
        attr.nodeValue = _uid
        el.attributes.setNamedItem(attr)
        // el.classList.add(this.class);
        this.handleDebug(this.#elBindingMap.get(el), el)
        let startTime = new Date().getTime();
        let styles = this.parseStyle(el)
        this.createStyles(styles, el)
        if (this.debug) {
            console.log('????????????', _uid, new Date().getTime() - startTime)
        }
        var observerOptions = {
            childList: false,  // ????????????????????????????????????????????????????????????
            attributes: true, // ??????????????????
            subtree: false     // ?????????????????????????????? false
        }
        let observer = new MutationObserver(() => {
            let startTime1 = new Date().getTime();
            let styles = this.parseStyle(el)
            this.createStyles(styles, el)
            if (this.debug) {
                console.log('????????????-', _uid, new Date().getTime() - startTime1)
            }
        });
        observer.observe(el, observerOptions);
        this.#observeMap.set(attr.nodeValue, observer)
    }

    parseVersion(el) {
        let attrs = el.attributes;
        let attrArr = [];
        for (let i = 0; i < attrs.length; i++) {
            attrArr.push(attrs[i])
        }
        let attrNames = attrArr.map(e => e.nodeName)
        let version = attrNames.filter(e => {
            return e?.startsWith('data-v')
        })?.[0]
        return version;
    }

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
                responsiveResult[this.responsiveDefine[responsiveDefineKey]].push(this.parseStyleResult(
                    el,
                    attrNames.filter((attr, index) => {
                        let status = attr.startsWith(responsiveDefineKey);
                        if (status) {
                            attrNames.splice(index, 1, '')
                        }
                        return status;
                    }).map(name => {
                        let key = name.replace(responsiveDefineKey, '')
                        return key;
                    })
                ));
            })
            attrNames = attrNames.filter(e => e);
            responsiveResult[''] = [this.parseStyleResult(el, attrNames)];
        } else {
            responsiveResult[''] = [this.parseStyleResult(el, attrNames)];
        }
        return responsiveResult;
    }

    parseStyleResult(el, attrNames) {
        let result = {}
        let allStyleCache = attrNames.map((name, index) => {
            let cache = this.#styleCache[name]
            if (cache) {
                this.debugCollect(el, function (value) {
                    if (value.length == 0) {
                        return ['??????????????????', name, cache]
                    } else {
                        if (value.includes(name)) {
                            return ['??????????????????', name, cache]
                        }
                    }
                })
                attrNames.splice(index, 1, '')
            }
            return cache;
        }).filter(e => e)
        //??????????????????key
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
                    this.debugCollect(el, function (value) {
                        if (value.length == 0) {
                            return ['????????????-??????', name, style]
                        } else {
                            if (value.includes(name)) {
                                return ['????????????-??????', name, style]
                            }
                        }
                    })
                    return [style]
                }
                return this.rules.filter(rule => {
                    return rule[0].test(key)
                }).map(rule => {
                    style = rule[1](rule[0], key);
                    this.#styleCache[key] = style;
                    this.debugCollect(el, function (value) {
                        if (value.length == 0) {
                            return ['????????????', rule[0], name, style]
                        } else {
                            if (value.includes(name)) {
                                return ['????????????', rule[0], name, style]
                            }
                        }
                    })
                    return style;
                })
            }).flat(Infinity)
            result[this.pseudoClassDefine[pseudoClassDefineKey]].push(...pseudoClassDefineStyles)
        })
        // ????????????
        attrNames = attrNames.filter(e => e);
        let allStyles = this.rules.map(rule => {
            let styles = attrNames.filter(e => {
                return rule[0].test(e)
            }).map(name => {
                let style = rule[1](rule[0], name);
                this.#styleCache[name] = style;
                this.debugCollect(el, function (value) {
                    if (value.length == 0) {
                        return ['????????????', rule[0], name, style]
                    } else {
                        if (value.includes(name)) {
                            return ['????????????', rule[0], name, style]
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

    createStyle(styles, el, pseudoClassDefineStr = '') {
        let _uid = el.getAttribute('uid')
        let selector = `${el.tagName.toLocaleLowerCase()}[uid="${_uid}"]${pseudoClassDefineStr}`;
        if (!styles || styles.length == 0) {
            let cssRules = this.#styleSheet.cssRules;
            for (let j = 0; j < cssRules.length; j++) {
                let cssRule = cssRules.item(j);
                if (cssRule.selectorText == selector) {
                    XClass.deleteRule(this.#styleSheet, j)
                    break;
                }
            }
            return;
        }

        let styleText = (styles?.length ?? 0) > 0 ? `
                ${el.tagName.toLocaleLowerCase()}[uid="${_uid}"]${pseudoClassDefineStr}{
                    ${styles.join('')}
                }
            `: ''
        this.debugCollect(el, function (value) {
            return ['????????????', styleText]
        })
        return {
            selector, styleText
        }
    }

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

    createStyles(responsiveResult, el) {
        if (responsiveResult) {
            Object.keys(responsiveResult).forEach(key => {
                //?????????????????????
                let responsiveArr = responsiveResult[key]
                //?????????????????????????????????
                let result = responsiveArr.reduce((prev, curt) => {
                    Object.keys(curt).forEach(innerKey => {
                        if (!prev[innerKey]) {
                            prev[innerKey] = []
                        }
                        prev[innerKey].push(...curt[innerKey])
                    })
                    return prev
                }, {})
                Object.keys(result).forEach(pseudoClassDefineStr => {
                    try {
                        let styleResult = this.createStyle(result[pseudoClassDefineStr], el, pseudoClassDefineStr || '')
                        if (styleResult) {
                            if (key) {
                                styleResult['newStyleText'] = key + `{${styleResult.styleText}}`
                            }
                            this.insertStyle(styleResult.selector, styleResult.styleText, styleResult.newStyleText)
                        }
                    } catch (ex) {
                        console.error(ex)
                    }
                })
            })
        }
        this.debugConsole(el)
    }



    handleDebug(binding, el) {
        if (this.debug) {
            let _uid = el.getAttribute('uid')
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

    debugCollect(el, callback) {
        if (this.debug) {
            let _uid = el.getAttribute('uid')
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
                console.log('????????????', _uid, el)
                console.log(this.#debugResultMap.get(_uid))
            }
        }

    }

    static insertRule(sheet, selectorText, cssText, position) {
        if (sheet.insertRule && cssText) {
            sheet.insertRule(cssText, position);
        }
        else
            if (sheet.addRule && cssText) { //??????IE??????
                sheet.addRule(selectorText, cssText, position);
            }
    }

    static deleteRule(sheet, index) {
        if (sheet.deleteRule) {
            sheet.deleteRule(index);
        }
        else
            if (sheet.removeRule) { //??????IE??????
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