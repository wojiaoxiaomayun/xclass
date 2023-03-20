import XClass from 'xclass-core'
export  const  transform = (code, xclass) => {
    let matchTags = code.matchAll(/<(?!\/)([^>]*?)(xclass.*?)>/gims)
    let tags = Array.from(matchTags, tag => tag[0]);
    let styleTexts = []
    tags.filter(tag => {
        let dymicClass = /:class="(.*?)"/gims.exec(tag);
        return !tag.startsWith('<!') && (!dymicClass || dymicClass.length == 0)
    }).forEach(tag => {
        let guid = XClass.guid();
        let tagName = /<(.*?)\s/gims.exec(tag)[1]
        let attrNamesStr = /[^\w]class="(.*?)"/gims.exec(tag)
        if(attrNamesStr){
            let attrNames = (attrNamesStr[1] ?? '').split(' ')
            let styleResult = xclass.parseStyleNode(attrNames,guid)
            let styleText = xclass.createStylesNode(styleResult, guid, tagName)
            styleTexts.push(styleText)
            let newTag = tag.replace(/<(?![/|!])([^>]*?)(xclass.*?)>/gims, `<$1$2 ${'uid="' + guid + '"'}>`)
            code = code.replace(tag, newTag)
        }
    })
    let appendStyle = styleTexts.map(styleText => {
        return styleText.map(info => {
            return info.map(e => {
                return e.newStyleText || e.styleText
            }).join('\n')
        }).join('\n')
    }).join('\n')
    code = `${code}<style scoped>${appendStyle}</style>`
    return code;
}