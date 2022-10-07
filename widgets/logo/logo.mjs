
/**
 * Copyright 2021 HolyCorn Software
 * The HCTS Project
 * 
 * This widget is just the logo
 * 
 * If you wonder why a whole widget is dedicated to just a simple button, then consider this:
 *      - Currently the logo is stored in /res/logo.webp
 *      - More that 4 modules have a hard reference to the logo
 * But then, tomorrow the logo may now be stored as /res/logo.png, or we want the situation where the logo can change according to the time of the year
 * Now do we go back to change all references to the logo. Imagine if there are 20 in assorted locations. 
 * Now this widget will centralize and control access to the logo, to allow for a variety of logos under different themes
 * Finally, the logo has to be consistent in size. What sure way can we achieve this ?
 * 
 **/

import {Widget} from '../../lib/widget/index.mjs'

export class HCTSLogo extends Widget{

    constructor({returnHomeOnClick=true, image}={}){
        super({css:import.meta.url})

        this.html = document.spawn({
            class:'hc-hcts-logo',
            innerHTML:`
                <div class='container'>
                    <img src='/$/shared/static/logo.png'>
                </div>
            `
        })


        this.html.on('click', ()=>{
            if(this.returnHomeOnClick){
                window.location = '/'
            }
        })

        this.htmlProperty('img', '__image__', 'attribute', undefined, 'src')

        


        Object.assign(this, arguments[0])
        
        
    }

    set image(img){
        if(!img) return;
        this.__image__ = img;
    }
    get image(){
        this.__image__ = img;
    }

    static default(){
        return new this({})
    }
    
    
}

