import { createUnplugin } from 'unplugin'
import XClass from 'xclass-core'
const XclassPlugin = createUnplugin((options) => {
  return {
    name: 'unplugin-xclass',
    // webpack's id filter is outside of loader logic,
    // an additional hook is needed for better perf on webpack
    transformInclude(id) {
      return id.endsWith('.vue')
    },
    // just like rollup transform
    transform(code) {
      let matchTags = code.matchAll(/<((?!\/)[\\s\\S]+?)(\sxclass.*?=\".*?\"\s)([\\s\\S]+?)>/gmi)
      let tags = Array.from(matchTags,tag => tag[0]);
      tags.forEach(tag => {
        let newTag = tag.replace(/<((?!\/)[\\s\\S]+?)(\sxclass.*?=\".*?\"\s)([\\s\\S]+?)>/gi,`<$1 $2 ${'uid="' + XClass.guid() + '"'} $3>`)
        code = code.replace(tag,newTag)
      })
      let styleStr = code.matchAll(/<style[\\s\\S]*?\/style>/gim);
      let styles = Array.from(styleStr,tag => tag[0]);
      console.log(styles)
      return code;
    },
    // more hooks coming
  }
})
export default XclassPlugin;
export const vitePlugin = XclassPlugin.vite
export const rollupPlugin = XclassPlugin.rollup
export const webpackPlugin = XclassPlugin.webpack
export const rspackPlugin = XclassPlugin.rspack
export const esbuildPlugin = XclassPlugin.esbuild