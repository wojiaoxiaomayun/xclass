const rules = [
    //width
    [/^(?:size-)?(min-|max-)?([wh])-?(.+)$/,(arr,text,themes) => {
        let str = `${arr[1] || ''}${arr[2] == 'w'?'width':'height'}:${handleSize(arr[3])};`
        return str 
    }],
    [/^(?:border-|b-)([ltrb])?-?(\d+)?-?(solid|dashed|double|none)?-?(.*)$/,(arr,text,themes) => {
        let positionMap = {
            l:'left',
            t:'top',
            r:'right',
            b:'bottom',
        }
        let str = `border${arr[1]?('-' + positionMap[arr[1]]):''}:${handleSize(arr[2] || 1)} ${arr[3] || 'solid'} ${handleColor(themes,arr[4])};`
        return str
    }],
    [/^(inline-)?(?:flex)-?(r|c|cr|rr)?-?(wrap)?-?(gap)?-?(.*)$/,(arr,text,themes) => {
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
    [/^(align|justify|alignc)-(start|end|center|between|around|stretch|evenly)$/,(arr,text,themes) => {
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
    [/^(?:overflow|o|over|flow)-(h|a|v|hidden|auto|visible)$/,(arr,text,themes) => {
        let map = {
            h:'hidden',
            a:'auto',
            v:'visible'
        }
        let str = `overflow:${map[arr[1]] || arr[1]};`;
        return str;
    }],
    [/^(?:font-|f-)?(size|weight|color)-(.*)$/,(arr,text,themes) => {
        let str = ''
        if(arr[1]){
            if(arr[1] == 'color'){
                str += `color:${handleColor(themes,arr[2])};`
            }else{
                str += `font-${arr[1]}:${arr[1] == 'size'?handleSize(arr[2]):arr[2]};`;
            }
        }else{
            str += `font-size:${handleSize(arr[2])};`
        }
        return str;
    }],
    [/^(margin|padding)-([ltrb])?-?(.*)$/,(arr,text,themes) => {
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
    [/^(?:bg)-(.*)$/,(arr,text,themes) => {
        let str = `background:${handleColor(themes,arr[1])};`
        return str;
    }],
    [/^(?:radius)-(tl|tr|bl|br)?-?(.*)$/,(arr,text,themes) => {
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
    [/^(?:cursor|cur)-(.*)$/,(arr,text,themes) => {
        let str = `cursor:${arr[1]};`;
        return str;
    }],
    [/^(absolute|relative|fixed)$/,(arr,text,themes) => {
        let str = `position:${arr[1]};`;
        return str;
    }],
    [/^(left|right|top|bottom)-(.*)$/,(arr,text,themes) => {
        let str = `${arr[1]}:${handleSize(arr[2])};`;
        return str;
    }]
]

const themes = {
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

const pseudoClassDefine = {
    'hover:':':hover'
}

const responsiveDefine = {
    'md:':'@media screen and (max-width:500px)'
}

const handleColor = (themes,str) => {
    return themes[str] || str || 'white'
}

const handleSize = (str) =>{
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

const preset = () => {
    return {
        rules,
        themes,
        pseudoClassDefine,
        responsiveDefine
    }
}

export default preset;