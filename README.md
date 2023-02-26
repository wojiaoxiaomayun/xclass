# &#x20;XClass

实时解析短类到 css，自定义规则解析文本。

本工具支持所有框架，使用原生js操作dom，不关联任何框架。

***

## 前言

工具的原因是我受够了类名，Tailwindcss和windcss感觉太重量级了，我是antfu的粉丝，一直在看他的直播，因为学习了antfu的unocss，感觉非常酷。但是由于公司的项目，Node版本只有12，由于某些原因无法升级，还有很多一起开发的同事。不可能发动所有同事一起升级Node。 unocss最低要求node版本为16，所以制作了这个工具。 ，它是实时解析的。由于是我自己写的，所以我可以自定义一些我需要的东西。当然，在性能上肯定不如其他编译框架，但也不慢，毫秒级输出。对于普通项目来说，完全够用了。本来只是想写个vue组件自己用，后来在优化的过程中慢慢发现可以全部支持，何乐而不为呢？

## 功能介绍

*   [x] 支持自定义规则解析style
*   [x] 支持自定义伪类前缀，如hover,after
*   [x] debug模式，支持调试某个div上所有的解析内容，支持调试某个短类解析内容。
*   [x] 缓存模式，所有短类解析后会缓存，下次直接获取，当然也可以支持非缓存模式，也可以设置版本，版本升级则删除其他版本缓存,可设置缓存时间
*   [x] 自定义颜色，如bg-primary，项目中用到的一些框架，配置后可以直接使用
*   [x] 即时处理，在某个div上设置后会立即解析当前规则然后插入dom
*   [ ] 响应式（正在开发）

## 使用实例

Vue-Example：

```vue
<div v-xclass class="w-100 padding-12 bg-primary hover:bg-warning hover:f-color-white flex align-center justify-center radius-50 cursor-pointer">example</div>
```

Result:

![normal](https://note.youdao.com/favicon.ico)![hover](https://note.youdao.com/favicon.ico)
