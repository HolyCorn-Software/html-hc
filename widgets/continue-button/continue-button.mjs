/*
Copyright 2021 HolyCorn Software
This module represents a beautiful button that shows a forward arrow upon hover
*/

import { Widget,hc } from "../../lib/widget/index.mjs";

export default class ContinueButton extends Widget{

    constructor({text}={}){

        super();

        this.html = document.spawn({
            class:'hc-continue-button',
            innerHTML:`
                <div class='content'>
                    <div class='text'>Continue</div>
                    <div class='arrow'>></div>
                </div>
            `
        })

        this.html.$('.content').addEventListener('click', ()=>this.dispatchEvent(new CustomEvent( 'click')))

        Object.assign(this, arguments[0]);
        
    }
    set text(txt){
        this.html.$('.text').innerHTML = txt;
    }
    set loading(l){
        this.html.classList[l?'add':'remove']('loading');
    }
    get loading(){
        return this.html.classList.contains('loading');
    }
    
    
}

hc.importModuleCSS(import.meta.url);