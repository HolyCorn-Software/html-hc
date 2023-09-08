/**
 * Copyright 2023 HolyCorn Software
 * The Tele-Epilepsy Project
 * This module allows widgets to define image properties, that guarantee that svg elements are imported inline
 */

import { hc, Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";

const IMG_URL = Symbol()


const urlFetch = async (url) => {
    return await fetch(
        new URL(url, import.meta.url).href
    );
}


/**
 * Tells us if the response is for an SVG image
 * @param {Response} response 
 * @returns {boolean}
 */
const detectSVGFromHeader = (response) => /(xml)|(svg)/gi.test(response.headers.get('Content-Type'))

const detectSVGFromContent = (svgText) => /<svg/gi.test(svgText);


/**
 * This method tells us if the response contains an SVG element
 * @param {Response} response 
 * @returns {Promise<boolean>}
 */
const detectSVGFromResponse = async (response) => detectSVGFromHeader(response) || (await detectSVGFromContent(response.clone()))



/**
 * This method defines an image property on a widget, that would intercept 
 * svg images, and insert them inline
 * @template {Widget} WidgetType
 * @this {WidgetType}
 * @param {string} property 
 * @param {string} selector 
 * @param {string} cwd
 * @param {"inline"|"background"} mode
 */
export default function defineImageProperty(property, selector, cwd, mode = 'inline') {

    const original = hc.getCaller(0, [/html-hc\/lib/])

    Reflect.defineProperty(
        this, property,
        {
            set: async (url0) => {

                const iconElm = this.html.$(selector);

                if (typeof url0 === 'undefined') {
                    iconElm[IMG_URL] = url0;
                    iconElm.querySelectorAll('img,svg').forEach(x => x.remove(Z))
                    return
                }
                const url = new URL(url0, cwd || hc.getCaller(1, [/html-hc\/lib/]) || original).href
                if (mode == 'inline') {
                    const getImageNormally = async () => {
                        [...iconElm.children].forEach(x => x.remove())
                        iconElm.appendChild(
                            hc.spawn({ tag: 'img', attributes: { src: url }, classes: ['hc-widget-image'] })
                        );
                    }

                    let response

                    //This method economically gets the response for getting the URL
                    const getResponse = async () => response ||= await urlFetch(url)


                    if (await detectSVGFromResponse(await getResponse())) { //If it's an svg icon
                        //Append directly
                        iconElm.innerHTML = await response.text()
                    } else {
                        //Or just use the src way of doing things
                        getImageNormally()
                    }
                } else {
                    iconElm.style.setProperty('background-image', `url('${url}')`)
                }
                iconElm[IMG_URL] = url
            },
            get: () => {
                return this.html.$(selector)[IMG_URL]
            },
            configurable: true,
            enumerable: true,
        }
    )

}

hc.importModuleCSS(import.meta.url)