import { createUnplugin } from 'unplugin'
import XClass from '@xnocss/core'
import { transform } from './transform.js'
export type UserOptions = {
  presets:Array<any>,
  rules:Array<any>,
  pseudoClassDefine:Object,
  responsiveDefine:Object,
  shortDefine:Object,
  themes:Object,
  cacheExpire:number,
  version:string,
  debug:boolean,
  clearCache:boolean,
  initialRenderNum:number
}
const XclassPlugin = createUnplugin((options:UserOptions = {
  presets:[],
  rules:[],
  pseudoClassDefine:{},
  responsiveDefine:{},
  shortDefine:{},
  themes:{},
  cacheExpire:-1,
  version:'1.0.0',
  debug:false,
  clearCache:true,
  initialRenderNum:1000
}) => {
  let rules = Object.assign(options?.presets?.map(preset=> preset.rules || [])?.reduce((prev,curt) => {
      prev.push(...curt)
      return prev;
  },[]) || [],options?.rules || []);
  let pseudoClassDefine = Object.assign(options?.presets?.map(preset=> preset.pseudoClassDefine || {})?.reduce((prev,curt) => {
      Object.assign(prev,curt)
      return prev;
  },{}) || {},options?.pseudoClassDefine || {});
  let responsiveDefine = Object.assign(options?.presets?.map(preset=> preset.responsiveDefine || {})?.reduce((prev,curt) => {
      Object.assign(prev,curt)
      return prev;
  },{}) || {},options?.responsiveDefine || {});
  let shortDefine = Object.assign(options?.presets?.map(preset=> preset.shortDefine || {})?.reduce((prev,curt) => {
      Object.assign(prev,curt)
      return prev;
  },{}) || {},options?.shortDefine || {});
  let themes = Object.assign(options?.presets?.map(preset=> preset.themes || {})?.reduce((prev,curt) => {
      Object.assign(prev,curt)
      return prev;
  },{}) || {},options?.themes || {});

  let xclass = new XClass({
    rules,pseudoClassDefine,responsiveDefine,shortDefine,themes
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
export const XclassPluginVite = XclassPlugin.vite
export const XclassPluginWebpack = XclassPlugin.webpack
