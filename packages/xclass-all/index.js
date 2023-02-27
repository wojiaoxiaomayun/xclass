import XClass from "@xclass/core";
import {rules,colors,pseudoClassDefine} from "@xclass/core"
const XClassAll = () => {
    let xclass = new XClass({
        rules,colors,pseudoClassDefine
    })
    console.log(window)
    var observerOptions = {
        childList: true,
        attributes: false,
        subtree: true 
    }
    let observer = new MutationObserver((e) => {
        e.forEach(e => {
        if(e.addedNodes.length > 0){
            window.requestIdleCallback(() => {
                let nodes = document.querySelectorAll('[x-class]:not([uid])')
                if(nodes.length > 0){
                    for(let i = 0; i < nodes.length; i++){
                        xclass.bind(nodes.item(i),{})
                    }
                }
            })
        }
        })
    });
    observer.observe(document.body, observerOptions);
}
export default XClassAll;