# &#x20;XClass

Real time parse short class to css,custom rule to parse text.

This tool supports all frameworks, uses native js to operate dom, and is not associated with any framework.

***

## Brief introduction

The reason for the tool is that I am fed up with the class name, Tailwindcss and windcss feel too heavyweight, I am a fan of antfu, and I have been watching his live broadcast, because I have learned about antfu's unocss, and it feels so cool. However, due to the company's project, the Node version is only 12. For some reasons, it cannot be upgraded, and there are many colleagues who develop together. It is impossible to mobilize all colleagues to upgrade Node together. The minimum unocss requires node version 16, so this tool was produced. , it is parsed in real time. Since I wrote it myself, I can customize some things I need. Of course, in terms of performance, it is definitely not as good as other compiled frameworks, but it is not slow, output in milliseconds. For ordinary projects, it is completely sufficient. Originally, I just wanted to write a vue component for my own use, but gradually found that it can support all of them during the optimization process, so why not?

## Function introduction

*[X] Support custom rule parsing style
*[X] Support custom pseudo-class prefixes, such as hover, after
*[X] debug mode, which supports debugging all the parsed content on a div, and debugging the parsed content of a short class.
*[X] Cache mode. All short classes will be cached after parsing, and will be directly obtained next time. Of course, non-cache mode can also be supported, and version can also be set. Version upgrade will delete other version caches, and cache time can be set
*[X] Custom colors, such as bg-primary, some frames used in the project, can be used directly after configuration
*[X] Immediate processing. After setting on a div, the current rule will be parsed immediately and then the dom will be inserted
*[X] Responsive
*[X] Native framework support
*[X] Custom collection class

## Use Instance

Vue-Example：

```vue
<div v-xclass class="w-100 padding-12 bg-primary hover:bg-warning hover:f-color-white flex align-center justify-center radius-50 cursor-pointer">example</div>
```
Native：

```html
<div xclass class="w-100 padding-12 bg-primary hover:bg-warning hover:f-color-white flex align-center justify-center radius-50 cursor-pointer">example</div>
```
Result:

<img src="data:image/png;base64,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" />
<img src="data:image/png;base64,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" />

