export const rules = [
    //width
    [/^(?:size-)?(min-|max-)?([wh])-?(.+)$/,(rule,text) => {
        let arr = rule.exec(text)
        let str = `${arr[1] || ''}${arr[2] == 'w'?'width':'height'}:${handleSize(arr[3])};`
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
        let str = `border${arr[1]?('-' + positionMap[arr[1]]):''}:${handleSize(arr[2] || 1)} ${arr[3] || 'solid'} ${handleColor(arr[4])};`
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
                gap:${handleSize(arr[5])};
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
                str += `color:${handleColor(arr[2])};`
            }else{
                str += `font-${arr[1]}:${arr[1] == 'size'?handleSize(arr[2]):arr[2]};`;
            }
        }else{
            str += `font-size:${handleSize(arr[2])};`
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
            str += `${arr[1]}-${positionMap[arr[2]]}:${handleSize(arr[3])};`
        }else{
            str += `${arr[1]}:${handleSize(arr[3])};`
        }
        return str;
    }],
    [/^(?:bg)-(.*)$/,(rule,text) => {
        let arr = rule.exec(text)
        let str = `background:${handleColor(arr[1])};`
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
            str += `border-${positionMap[arr[1]]}-radius:${handleSize(arr[2])};`
        }else{
            str += `border-radius:${handleSize(arr[2])};`
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
        let str = `${arr[1]}:${handleSize(arr[2])};`;
        return str;
    }]
]

export const colors = {
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

export const pseudoClassDefine = {
    'hover:':':hover'
}

export const responsiveDefine = {
    'md:':'@media screen and (max-width:500px)'
}

export const handleColor = (str) => {
    return colors[str] || str || 'white'
}

export const handleSize = (str) =>{
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
}