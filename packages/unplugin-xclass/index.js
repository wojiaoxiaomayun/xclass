import { createUnplugin } from 'unplugin'
import XClass from 'xclass-core'
import {rules,colors,pseudoClassDefine,responsiveDefine} from "xclass-core"
import { transform } from './transform.js'
const XclassPlugin = createUnplugin((options) => {
  let xclass = new XClass({
    rules,colors,pseudoClassDefine,responsiveDefine
  });
  let hotUpdateCode = '';
  return {
    name: 'unplugin-xclass',
    enforce:'pre',
    // webpack's id filter is outside of loader logic,
    // an additional hook is needed for better perf on webpack
    transformInclude(id) {
      // return /^.*?\.vue(\?vue.*)?$/.test(id)
      return id.endsWith('.vue')
    },
    // just like rollup transform
    transform(code,id) {
      if(hotUpdateCode){
        let tempHotUpdateCode = hotUpdateCode;
        hotUpdateCode = '';
        return tempHotUpdateCode;
      }
      return transform(code,xclass);
    },
    vite:{
      async handleHotUpdate(ctx){
        const read = ctx.read
        ctx.read = async function(){
          hotUpdateCode = transform(await read(),xclass)
          return hotUpdateCode;
        }
      }
    }
    // more hooks coming
  }
})
export default XclassPlugin;
export const vitePlugin = XclassPlugin.vite
export const rollupPlugin = XclassPlugin.rollup
export const webpackPlugin = XclassPlugin.webpack
export const rspackPlugin = XclassPlugin.rspack
export const esbuildPlugin = XclassPlugin.esbuild