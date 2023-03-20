# &#x20;XClass

实时解析短类到 css，自定义规则解析文本。

本工具支持所有框架，使用原生js操作dom，不关联任何框架。

---

## 前言

工具的原因是我受够了类名，Tailwindcss和windcss感觉太重量级了，我是antfu的粉丝，一直在看他的直播，因为学习了antfu的unocss，感觉非常酷。但是由于公司的项目，Node版本只有12，由于某些原因无法升级，还有很多一起开发的同事。不可能发动所有同事一起升级Node。 unocss最低要求node版本为16，所以制作了这个工具。 ，它是实时解析的。由于是我自己写的，所以我可以自定义一些我需要的东西。当然，在性能上肯定不如其他编译框架，但也不慢，毫秒级输出。对于普通项目来说，完全够用了。本来只是想写个vue组件自己用，后来在优化的过程中慢慢发现可以全部支持，何乐而不为呢？

## 功能介绍

* [X] 支持自定义规则解析style
* [X] 支持自定义伪类前缀，如hover,after
* [X] debug模式，支持调试某个div上所有的解析内容，支持调试某个短类解析内容。
* [X] 缓存模式，所有短类解析后会缓存，下次直接获取，当然也可以支持非缓存模式，也可以设置版本，版本升级则删除其他版本缓存,可设置缓存时间
* [X] 自定义颜色，如bg-primary，项目中用到的一些框架，配置后可以直接使用
* [X] 即时处理，在某个div上设置后会立即解析当前规则然后插入dom
* [X] 响应式
* [X] 原生框架支持
* [X] 自定义合集类
* [X] 支持vue编译，编译完成后性能更佳

## 使用实例

安装
```node
npm install -S @xnocss/all
```
例子：

```javascript
import XClassAll from '@xnocss/all'
XClassAll({...options})
```
```html
<!--使用 xclass attr 识别，xclass 的标签将被解析-->
<div xclass class="w-100 padding-12 bg-primary hover:bg-warning hover:f-color-white flex align-center justify-center radius-50 cursor-pointer">example</div>
```
options配置：
```javascript
{
    //自定义颜色，使用时如bg-primary,会被翻译成background:#936ee6;
    colors:{
        primary:'#936ee6'
    },
    //自定义拦截规则，如w-10会被如下规则拦截，翻译成width:10px;
    rules:[
        [
            /^(?:size-)?(min-|max-)?([wh])-?(.+)$/,
            (rule,text) => {
                let arr = rule.exec(text)
                let str = `${arr[1] || ''}${arr[2] == 'w'?'width':'height'}:${handleSize(arr[3])};`
                return str 
            }
        ]
    ],
    //是否是新规则，覆盖自带规则
    ruleNew:true,
    // 伪类定义，hover：为前缀，如hover:f-color-white会被翻译为div:hover{color:white;}
    pseudoClassDefine:{
        'hover:':':hover',
        'first:':':first-of-type'
    },
    // 响应式定义，md:为前缀，如md:hover:f-color-white会被翻译为@media screen and (max-width:500px){div:hover{color:white;}}
    responsiveDefine:{
        'md:':'@media screen and (max-width:500px)'
    },
    //合集短类定义，custom会被转义成div{width:100px;height:100px;border-radius:16px;}
    shortDefine:{
        'custom':'w-100 h-100 radius-16'
    },
    //缓存时间，-1为永久，单位ms
    cacheExpire:-1,
    //版本号，配合清除缓存，如升级为1.0.1，则1.0.0版本缓存将被清除
    version:'1.0.0',
    //调试
    debug:false,
    // 是否每次清除缓存
    clearCache:false
}
```

标签后缀

> test
```html
<!-- 开启debug模式后 -->
<!-- 后缀包含test的将被打印，会被打印所有class解析结果 -->
<div xclass:test class="w-100 padding-12 bg-primary hover:bg-warning hover:f-color-white flex align-center justify-center radius-50 cursor-pointer">example</div>
<!-- 后缀包含test的将被打印，仅仅打印w-100 padding-12解析结果 -->
<div xclass:test="w-100 padding-12" class="w-100 padding-12 bg-primary hover:bg-warning hover:f-color-white flex align-center justify-center radius-50 cursor-pointer">example</div>
```
> real，仅在未编译时生效。
```html
<!-- 包含real的dom，将会被立即解析，其余dom仅在视窗内才被解析 -->
<div xclass.real class="w-100 padding-12 bg-primary hover:bg-warning hover:f-color-white flex align-center justify-center radius-50 cursor-pointer">example</div>
<!-- 可以一起使用 -->
<div xclass:test.real="w-100 padding-12" class="w-100 padding-12 bg-primary hover:bg-warning hover:f-color-white flex align-center justify-center radius-50 cursor-pointer">example</div>
```
