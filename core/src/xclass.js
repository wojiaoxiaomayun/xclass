const xclassUtil = {
    title:'XCLASS',
    version:'1.0.0',
    isClearCache:false,
    expire:-1,
    pseudoClassDefine:{
        'hover:':':hover'
    },
    debug:false,
    debugMap:new Map(),
    debugResultMap:new Map(),
    observeMap:new Map(),
    interSectionObserver:null,
    styleMap:new Map(),
    styleSheet:null,
    styleCache:{
    },
    elBindingMap:new Map(),
    init(){
        let cacheKey = xclassUtil.title + '_' + xclassUtil.version;
        if(xclassUtil.isClearCache){
            removeStorages(new RegExp(`${xclassUtil.title}_.*`))
        }else{
            removeStorages(new RegExp(`${xclassUtil.title}_.*`),[cacheKey])
        }
        let cache = getStorage(cacheKey) || {}
        xclassUtil.debugResultMap = new Map()
        xclassUtil.styleCache = new Proxy(cache,{
            get(target,key){
                return target[key]
            },
            set(target,key,value){
                target[key] = value
                setStorage(cacheKey,cache,xclassUtil.expire)
                return true;
            }
        })
        let doms = document.querySelectorAll(`style[title=${xclassUtil.title}]`)
        if(doms.length == 0){
            let style = document.createElement('style');
            style.type = 'text/css'
            style.title = xclassUtil.title
            // style.innerHTML = styleText
            let headNode = document.querySelector('head');
            headNode.appendChild(style)
        }
        let sheets = document.styleSheets;
        for(let i = sheets.length - 1; i >= 0; i--){
            let sheet = sheets.item(i);
            if(sheet.title == xclassUtil.title){
                xclassUtil.styleSheet = sheet;
            }
        }
        //加入视窗监视器，来保证进入视窗的元素才被渲染，大大降低了js使用率，成功避免渲染10000及更多节点卡死问题
        xclassUtil.interSectionObserver = new IntersectionObserver(xclassUtil.intersectionCallback,{
            rootMargin:'500px 0px'
        })
    },
    intersectionCallback(entries){
        entries.forEach(entry => {
            let el = entry.target
            if(entry.isIntersecting){
                xclassUtil.initNode(el)
                xclassUtil.interSectionObserver.unobserve(el)
            }
        })
    },
    bind(el,binding){
        xclassUtil.elBindingMap.set(el,binding)
        if(binding?.modifiers?.real){
            console.log('实时编译')
            this.initNode(el)
        }else{
            xclassUtil.interSectionObserver.observe(el)
        }
    },
    unbind(el){
        let _uid = el.getAttribute('uid')
        if(xclassUtil.observeMap.get(_uid)){
            xclassUtil.observeMap.get(_uid).disconnect();
            xclassUtil.observeMap.delete(_uid)
        }
    },
    initNode(el){
        let _uid = `${xclassUtil.title}-${guid()}`;
        let attr = document.createAttribute('uid');
        attr.nodeValue = _uid
        el.attributes.setNamedItem(attr)
        // el.classList.add(xclassUtil.class);
        xclassUtil.handleDebug(xclassUtil.elBindingMap.get(el),el)
        let startTime = new Date().getTime();
        let styles = xclassUtil.parseStyle(el)
        xclassUtil.createStyles(styles,el)
        if(xclassUtil.debug){
            console.log('生成时间',_uid,new Date().getTime() - startTime)
        }
        var observerOptions = {
            childList: false,  // 观察目标子节点的变化，是否有添加或者删除
            attributes: true, // 观察属性变动
            subtree: false     // 观察后代节点，默认为 false
        }
        let observer = new MutationObserver(function(mutationList){
            let startTime1 = new Date().getTime();
            let styles = xclassUtil.parseStyle(el)
            xclassUtil.createStyles(styles,el)
            if(xclassUtil.debug){
                console.log('生成时间-',_uid,new Date().getTime() - startTime1)
            }
        });
        observer.observe(el, observerOptions);
        xclassUtil.observeMap.set(attr.nodeValue,observer)
    },
    parseVersion(el){
        let attrs = el.attributes;
        let attrArr = [];
        for(let i = 0; i < attrs.length; i++){
            attrArr.push(attrs[i])
        }
        let attrNames = attrArr.map(e => e.nodeName)
        let version = attrNames.filter(e => {
            return e?.startsWith('data-v')
        })?.[0]
        return version;
    },
    parseStyle(el){
        let attrs = el.attributes;
        let attrNames = []
        let classList = el.classList
        classList.forEach(item => {
            attrNames.push(item)
        })
        for(let i = 0; i < attrs.length; i++){
            attrNames.push(attrs[i].nodeName)
        }
        let _uid = el.getAttribute('uid')
        let arr = xclassUtil.styleMap.get(_uid)
        if(arr && arr.length == attrNames.length){
            if(arr.filter(e => !attrNames.includes(e)).length == 0){
                return {}
            }
        }
        xclassUtil.styleMap.set(_uid,attrNames.map(e => e))
        let result = {}
        let allStyleCache = attrNames.map((name,index) => {
            let cache = xclassUtil.styleCache[name]
            if(cache){
                xclassUtil.debugCollect(el,function(value){
                    if(value.length == 0){
                        return ['规则生成缓存',name,cache]
                    }else{
                        if(value.includes(name)){
                            return ['规则生成缓存',name,cache]
                        }
                    }
                })
                attrNames.splice(index,1,'')
            }
            return cache;
        }).filter(e => e)
        //排除有缓存的key
        attrNames = attrNames.filter(e => e)
        Object.keys(xclassUtil.pseudoClassDefine).forEach(pseudoClassDefineKey => {
            if(!result[xclassUtil.pseudoClassDefine[pseudoClassDefineKey]]){
                result[xclassUtil.pseudoClassDefine[pseudoClassDefineKey]] = []
            }
            let pseudoClassDefineStyles = attrNames.filter((name,index) => {
                let status = name.startsWith(pseudoClassDefineKey);
                if(status){
                    attrNames.splice(index,1,'')
                }
                return status;
            }).map(name => {
                let key = name.replace(pseudoClassDefineKey,'')
                let style = xclassUtil.styleCache[key];
                if(style){
                    xclassUtil.debugCollect(el,function(value){
                        if(value.length == 0){
                            return ['规则生成-缓存',name,style]
                        }else{
                            if(value.includes(name)){
                                return ['规则生成-缓存',name,style]
                            }
                        }
                    })
                    return [style]
                }
                return xclassUtil.rules.filter(rule => {
                    return rule[0].test(key)
                }).map(rule => {
                    style = rule[1](rule[0],key);
                    xclassUtil.styleCache[key] = style;
                    xclassUtil.debugCollect(el,function(value){
                        if(value.length == 0){
                            return ['规则生成',rule[0],name,style]
                        }else{
                            if(value.includes(name)){
                                return ['规则生成',rule[0],name,style]
                            }
                        }
                    })
                    return style;
                })
            }).flat(Infinity)
            result[xclassUtil.pseudoClassDefine[pseudoClassDefineKey]].push(...pseudoClassDefineStyles)
        })
        // 再次排除
        attrNames = attrNames.filter(e => e);
        let allStyles = xclassUtil.rules.map(rule => {
            let styles = attrNames.filter(e => {
                return rule[0].test(e)
            }).map(name => {
                let style = rule[1](rule[0],name);
                xclassUtil.styleCache[name] = style;
                xclassUtil.debugCollect(el,function(value){
                    if(value.length == 0){
                        return ['规则生成',rule[0],name,style]
                    }else{
                        if(value.includes(name)){
                            return ['规则生成',rule[0],name,style]
                        }
                    }
                })
                return style;
            })
            return styles
        }).flat(Infinity)
        result[''] = allStyleCache.concat(allStyles);
        return result;
    },
    createStyle(styles,el,pseudoClassDefineStr = ''){
        let _uid = el.getAttribute('uid')
        let selector = `${el.tagName.toLocaleLowerCase()}[uid="${_uid}"]${pseudoClassDefineStr}`;
        if(!styles || styles.length == 0){
            let cssRules = xclassUtil.styleSheet.cssRules;
            for(let j = 0; j < cssRules.length; j++){
                let cssRule = cssRules.item(j);
                if(cssRule.selectorText == selector){
                    xclassUtil.deleteRule(xclassUtil.styleSheet,j)
                    break;
                }
            }
            return;
        }
        
        let styleText = (styles?.length ?? 0) > 0?`
                ${el.tagName.toLocaleLowerCase()}[uid="${_uid}"]${pseudoClassDefineStr}{
                    ${styles.join('')}
                }
            `:''
        xclassUtil.debugCollect(el,function(value){
            return ['最终结果',styleText]
        })
        let sheet = xclassUtil.styleSheet;
        if(sheet.title == xclassUtil.title){
            let cssRules = sheet.cssRules;
            let flag = true;
            for(let j = 0; j < cssRules.length; j++){
                let cssRule = cssRules.item(j);
                if(cssRule.selectorText == selector && cssRule.cssText != styleText){
                    xclassUtil.deleteRule(sheet,j)
                    xclassUtil.insertRule(sheet,selector,styleText,j)
                    flag = false
                    break;
                }
            }
            if(flag){
                // doms[0].append(styleText)
                xclassUtil.insertRule(sheet,selector,styleText,0)
            }
        }
    },
    createStyles(styles,el){
        if(styles){
            Object.keys(styles).forEach(key => {
                try{
                    xclassUtil.createStyle(styles[key],el,key || '')
                }catch(ex){
                    console.error(ex)
                }
            })
        }
        xclassUtil.debugConsole(el)
    },
    insertRule(sheet, selectorText, cssText, position){
        if (sheet.insertRule) {
            sheet.insertRule(cssText, position);
        }
        else
            if (sheet.addRule) { //仅对IE有效
                sheet.addRule(selectorText, cssText, position);
            }
    },
    deleteRule(sheet, index){
        if (sheet.deleteRule) {
            sheet.deleteRule(index);
        }
        else
            if (sheet.removeRule) { //仅对IE有效
                sheet.removeRule(index);
            }
    },
    handleColor(str){
        return xclassUtil.colors[str] || str || 'white'
    },
    handleSize(str){
        str += ''
        if(!str){
            return '14px'
        }
        if(str.includes('b') || str.includes('%')){
            return str.substring(0,str.length - 1).replace(/(-)?(\d+)/g,'$1$2%')
        }
        if(str.includes('p') || str.includes('px')){
            return str.replace(/(-)?(\d+)/g,'$1$2px')
        }
        return str.replace(/(-)?(\d+)/g,'$1$2px');
    },  
    handleDebug(binding,el){
        if(xclassUtil.debug){
            let _uid = el.getAttribute('uid')
            if(binding.arg == 'test'){
                let value = binding.value || [];
                if(typeof value == 'string'){
                    value = value.split(' ')
                }
                xclassUtil.debugMap.set(_uid,value || [])
            }else{
                xclassUtil.debugMap.delete(_uid)
            }
        }
    },
    debugCollect(el,callback){
        if(xclassUtil.debug){
            let _uid = el.getAttribute('uid')
            if(xclassUtil.debugMap.get(_uid)){
                let value = xclassUtil.debugMap.get(_uid) || []
                if(callback){
                    let result = callback(value)
                    if(!xclassUtil.debugResultMap.get(_uid)){
                        xclassUtil.debugResultMap.set(_uid,[])
                    }
                    if(result){
                        xclassUtil.debugResultMap.get(_uid).push(result)
                    }
                }
            }

        }
    },
    debugConsole(el){
        if(xclassUtil.debug){
            let _uid = el.getAttribute('uid')
            if(xclassUtil.debugMap.get(_uid)){
                console.log('测试结果',_uid,el)
                console.log(xclassUtil.debugResultMap.get(_uid))
            }
        }
        
    },
    rules:[
        //width
        [/^(?:size-)?(min-|max-)?([wh])-?(.+)$/,(rule,text) => {
            let arr = rule.exec(text)
            let str = `${arr[1] || ''}${arr[2] == 'w'?'width':'height'}:${xclassUtil.handleSize(arr[3])};`
            return str 
        }],
        [/^(?:border-|b-)([ltrb])?-?(\d+)?-?(solid|dashed|double|none)?-?(.*)$/,(rule,text) => {
            let arr = rule.exec(text)
            let positionMap = {
                l:'left',
                t:'top',
                r:'right',
                b:'bottom',
            }
            let str = `border${arr[1]?('-' + positionMap[arr[1]]):''}:${xclassUtil.handleSize(arr[2] || 1)} ${arr[3] || 'solid'} ${xclassUtil.handleColor(arr[4])};`
            return str
        }],
        [/^(inline-)?(?:flex)-?(r|c|cr|rr)?-?(wrap)?-?(gap)?-?(.*)$/,(rule,text) => {
            let arr = rule.exec(text)
            let str = `
                display:${arr[1] || ''}flex;
            `;
            if(arr[2]){
                let direcMap = {
                    c:'column',
                    r:'row',
                    cr:'column-resever',
                    rr:'row-resever',
                }
                str += `
                    flex-direction:${direcMap[arr[2]]};
                `
            }
            if(arr[3]){
                str +=  `
                    flex-wrap:wrap;
                `
            }
            if(arr[4]){
                str +=  `
                    gap:${xclassUtil.handleSize(arr[5])};
                `
            }
            return str;
        }],
        [/^(align|justify|alignc)-(start|end|center|between|around|stretch|evenly)$/,(rule,text) => {
            let arr = rule.exec(text)
            let map = {
                align:'align-items',
                alignc:'align-content',
                justify:'justify-content',
                start:'flex-start',
                end:'flex-end',
                center:'center',
                between:'space-between',
                around:'space-around',
                evenly:'space-evenly',
                stretch:'stretch',
            }
            let str = `${map[arr[1]]}:${map[arr[2]]};`;
            return str;
        }],
        [/^(?:overflow|o|over|flow)-(h|a|v|hidden|auto|visible)$/,(rule,text) => {
            let arr = rule.exec(text)
            let map = {
                h:'hidden',
                a:'auto',
                v:'visible'
            }
            let str = `overflow:${map[arr[1]] || arr[1]};`;
            return str;
        }],
        [/^(?:font-|f-)?(size|weight|color)-(.*)$/,(rule,text) => {
            let arr = rule.exec(text)
            let str = ''
            if(arr[1]){
                if(arr[1] == 'color'){
                    str += `color:${xclassUtil.handleColor(arr[2])};`
                }else{
                    str += `font-${arr[1]}:${arr[1] == 'size'?xclassUtil.handleSize(arr[2]):arr[2]};`;
                }
            }else{
                str += `font-size:${xclassUtil.handleSize(arr[2])};`
            }
            return str;
        }],
        [/^(margin|padding)-([ltrb])?-?(.*)$/,(rule,text) => {
            let arr = rule.exec(text)
            let str = ''
            let positionMap = {
                l:'left',
                t:'top',
                r:'right',
                b:'bottom',
            }
            if(arr[2]){
                str += `${arr[1]}-${positionMap[arr[2]]}:${xclassUtil.handleSize(arr[3])};`
            }else{
                str += `${arr[1]}:${xclassUtil.handleSize(arr[3])};`
            }
            return str;
        }],
        [/^(?:bg)-(.*)$/,(rule,text) => {
            let arr = rule.exec(text)
            let str = `background:${xclassUtil.handleColor(arr[1])};`
            return str;
        }],
        [/^(?:radius)-(tl|tr|bl|br)?-?(.*)$/,(rule,text) => {
            let arr = rule.exec(text)
            let positionMap = {
                tl:'top-left',
                tr:'top-right',
                bl:'bottom-left',
                br:'bottom-right',
            }
            let str = '';
            if(arr[1]){
                str += `border-${positionMap[arr[1]]}-radius:${xclassUtil.handleSize(arr[2])};`
            }else{
                str += `border-radius:${xclassUtil.handleSize(arr[2])};`
            }
            return str;
        }],
        [/^(?:cursor|cur)-(.*)$/,(rule,text) => {
            let arr = rule.exec(text)
            let str = `cursor:${arr[1]};`;
            return str;
        }],
        [/^(absolute|relative|fixed)$/,(rule,text) => {
            let arr = rule.exec(text)
            let str = `position:${arr[1]};`;
            return str;
        }],
        [/^(left|right|top|bottom)-(.*)$/,(rule,text) => {
            let arr = rule.exec(text)
            let str = `${arr[1]}:${xclassUtil.handleSize(arr[2])};`;
            return str;
        }]
    ],
    colors:{
        primary:'#936ee6',
        success:'#6cad24',
        warning:'#d3a52c',
        danger:'#d86669',
        info:'#5aa7de',
        'text-primary':'#121212',
        'text-regular':'#646464',
        'text-secondary':'#8590a6',
        'text-placeholder':'#8590a6',
        'border-base':'#DCDFE6',
        'border-light':'#E4E7ED'
    }
}
export const guid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
export const setStorage = (key, value, expire = 7200000) => {
    let data = {
        value: value,
        expire: expire,
        timestamp: Date.now(),
        isForever:expire == -1
    }
    window.localStorage.setItem(key, JSON.stringify(data))
}
export const getStorage = key => {
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
export const removeStorage = key => {
    window.localStorage.removeItem(key)
}
export const removeStorages = (regx,exclude = []) => {
    Object.keys(window.localStorage).filter(e => {
        return regx.test(e) && !exclude.includes(e)
    }).forEach(key => {
        window.localStorage.removeItem(key)
    })
}
const xclass = {
    install(app, options) {
        if(options){
            if(options.colors){
                Object.keys(options.colors).forEach(key => {
                    xclassUtil.colors[key] = options.colors[key]
                })
            }
            if(options.rules){
                if(options.ruleNew){
                    xclassUtil.rules = options.rules
                }else{
                    xclassUtil.rules.push(...options.rules)
                }
            }
            if(options.expire){
                xclassUtil.expire = options.expire;
            }
            if(options.version){
                xclassUtil.version = options.version;
            }
            xclassUtil.debug = options.debug || false;
            if(options.clearCache){
                xclassUtil.isClearCache = options.clearCache;
            }
            if(options.pseudoClassDefine){
                Object.keys(options.pseudoClassDefine).forEach(key => {
                    xclassUtil.pseudoClassDefine[key] = options.pseudoClassDefine[key]
                })
            }
        }
        xclassUtil.init();
        if(app.version[0] == 3){
            app.directive('xclass', {
                beforeMount(el, binding, vnode, prevVnode) {
                    xclassUtil.bind(el,binding)
                },
                beforeUnmount(el, binding, vnode, prevVnode) {
                    xclassUtil.unbind(el)
                }
            })
        }else{
            app.directive('xclass', {
                bind(el, binding, vnode, prevVnode) {
                    xclassUtil.bind(el,binding)
                },
                unbind(el, binding, vnode, prevVnode) {
                    xclassUtil.unbind(el)
                }
            })
        }
    },
    
}
export default xclass;