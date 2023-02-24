const xclassUtil = {
    title:'XCLASS',
    isClearCache:true,
    expire:-1,
    pseudoClassDefine:{
        'hover:':':hover'
    },
    debug:false,
    debugMap:{},
    debugResultMap:{},
    observeMap:{},
    styleMap:{},
    styleSheet:null,
    styleCache:{

    },
    init(){
        let cacheKey = xclassUtil.title + '_' + md5(xclassUtil.rules.map(e => e[0] + '').join(';'),16);
        if(xclassUtil.isClearCache){
            removeStorages(new RegExp(`${xclassUtil.title}_.*`))
        }else{
            removeStorages(new RegExp(`${xclassUtil.title}_.*`),[cacheKey])
        }
        let cache = getStorage(cacheKey) || {}
        xclassUtil.debugResultMap = {}
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
    },
    bind(el,binding){
        let _uid = `${xclassUtil.title}-${guid()}`;
        let attr = document.createAttribute('uid');
        attr.nodeValue = _uid
        el.attributes.setNamedItem(attr)
        // el.classList.add(xclassUtil.class);
        xclassUtil.handleDebug(binding,el)
        let styles = xclassUtil.parseStyle(el)
        xclassUtil.createStyles(styles,el)

        var observerOptions = {
            childList: false,  // 观察目标子节点的变化，是否有添加或者删除
            attributes: true, // 观察属性变动
            subtree: false     // 观察后代节点，默认为 false
        }
        let observer = new MutationObserver(function(mutationList){
            let styles = xclassUtil.parseStyle(el)
            xclassUtil.createStyles(styles,el)
        });
        observer.observe(el, observerOptions);
        xclassUtil.observeMap[attr.nodeValue] = observer
    },
    unbind(el){
        let _uid = el.getAttribute('uid')
        if(xclassUtil.observeMap[_uid]){
            xclassUtil.observeMap[_uid].disconnect();
            delete xclassUtil.observeMap[_uid]
        }
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
        let arr = xclassUtil.styleMap[_uid]
        if(arr && arr.length == attrNames.length){
            if(arr.filter(e => !attrNames.includes(e)).length == 0){
                return {}
            }
        }
        xclassUtil.styleMap[_uid] = attrNames.map(e => e)
        let result = {}
        let noPseudoAttrName = JSON.parse(JSON.stringify(attrNames))
        Object.keys(xclassUtil.pseudoClassDefine).forEach(pseudoClassDefineKey => {
            let pseudoClassDefineStyles = attrNames.filter(name => {
                let status = name.startsWith(pseudoClassDefineKey);
                if(status){
                    let index = noPseudoAttrName.indexOf(name)
                    if(index > -1){
                        noPseudoAttrName.splice(noPseudoAttrName.indexOf(name),1)
                    }
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
            result[pseudoClassDefineKey] = pseudoClassDefineStyles
        })
        let allStyles = xclassUtil.rules.map(rule => {
            let styles = noPseudoAttrName.filter(e => {
                return rule[0].test(e)
            }).map(name => {
                let style = xclassUtil.styleCache[name];
                if(!style){
                    style = rule[1](rule[0],name);
                    xclassUtil.styleCache[name] = style;
                }
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
        result['allStyles'] = allStyles;
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
            let _uid = el.getAttribute('uid')
            Object.keys(styles).forEach(key => {
                try{
                    xclassUtil.createStyle(styles[key],el,xclassUtil.pseudoClassDefine[key] || '')
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
                xclassUtil.debugMap[_uid] = value || []
            }else{
                delete xclassUtil.debugMap[_uid]
            }
        }
    },
    debugCollect(el,callback){
        if(xclassUtil.debug){
            let _uid = el.getAttribute('uid')
            if(xclassUtil.debugMap[_uid]){
                let value = xclassUtil.debugMap[_uid] || []
                if(callback){
                    let result = callback(value)
                    if(!xclassUtil.debugResultMap[_uid]){
                        xclassUtil.debugResultMap[_uid] = []
                    }
                    if(result){
                        xclassUtil.debugResultMap[_uid].push(result)
                    }
                }
            }

        }
    },
    debugConsole(el){
        if(xclassUtil.debug){
            let _uid = el.getAttribute('uid')
            if(xclassUtil.debugMap[_uid]){
                console.log('测试结果',_uid,el)
                console.log(xclassUtil.debugResultMap[_uid])
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
function md5(string,bit) {
    function md5_RotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }
    function md5_AddUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }
    function md5_F(x, y, z) {
        return (x & y) | ((~x) & z);
    }
    function md5_G(x, y, z) {
        return (x & z) | (y & (~z));
    }
    function md5_H(x, y, z) {
        return (x ^ y ^ z);
    }
    function md5_I(x, y, z) {
        return (y ^ (x | (~z)));
    }
    function md5_FF(a, b, c, d, x, s, ac) {
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_F(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    };
    function md5_GG(a, b, c, d, x, s, ac) {
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_G(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    };
    function md5_HH(a, b, c, d, x, s, ac) {
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_H(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    };
    function md5_II(a, b, c, d, x, s, ac) {
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_I(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    };
    function md5_ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };
    function md5_WordToHex(lValue) {
        var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    };
    function md5_Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };
    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
    string = md5_Utf8Encode(string);
    x = md5_ConvertToWordArray(string);
    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
    for (k = 0; k < x.length; k += 16) {
        AA = a; BB = b; CC = c; DD = d;
        a = md5_FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = md5_FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = md5_FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = md5_FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = md5_FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = md5_FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = md5_FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = md5_FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = md5_FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = md5_FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = md5_FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = md5_FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = md5_FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = md5_FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = md5_FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = md5_FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = md5_GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = md5_GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = md5_GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = md5_GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = md5_GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = md5_GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = md5_GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = md5_GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = md5_GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = md5_GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = md5_GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = md5_GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = md5_GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = md5_GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = md5_GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = md5_GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = md5_HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = md5_HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = md5_HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = md5_HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = md5_HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = md5_HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = md5_HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = md5_HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = md5_HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = md5_HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = md5_HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = md5_HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = md5_HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = md5_HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = md5_HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = md5_HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = md5_II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = md5_II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = md5_II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = md5_II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = md5_II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = md5_II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = md5_II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = md5_II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = md5_II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = md5_II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = md5_II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = md5_II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = md5_II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = md5_II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = md5_II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = md5_II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = md5_AddUnsigned(a, AA);
        b = md5_AddUnsigned(b, BB);
        c = md5_AddUnsigned(c, CC);
        d = md5_AddUnsigned(d, DD);
    }
    if(bit==32){
        return (md5_WordToHex(a) + md5_WordToHex(b) + md5_WordToHex(c) + md5_WordToHex(d)).toLowerCase();
    }
    return (md5_WordToHex(b) + md5_WordToHex(c)).toLowerCase();
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
        console.log(app.version[0])
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