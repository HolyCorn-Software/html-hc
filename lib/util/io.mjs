/**
 * Copyright 2022 HolyCorn Software
 * This module contains useful function related to input output in browser environments
 */

import { hc } from "../widget/index.mjs"



/**
 * This method is used to read a single blob file directly
 * @param {Blob} blob 
 * @param {object} param1
 * @param {('url'|'binary'|'buffer')} param1.mode
 * @returns {Promise<string>}
 */
function readBlob(blob, { mode }) {
    const reader = new FileReader(blob)
    return new Promise((resolve, reject) => {
        switch (mode) {
            case 'url':
            default:
                console.log(`reading as url`)
                reader.readAsDataURL(blob)
                break;
            case 'binary':
                reader.readAsBinaryString(blob)
                break;

            case 'buffer':
                reader.readAsArrayBuffer(blob)
                break;

        }
        reader.onloadend = () => {
            resolve(reader.result)
        }
        reader.onerror = (event) => reject(event)
    })
}


/**
 * This method is used to fetch data about an image or video to produce a thumbnail
 * @param {string|Blob} blobOrURL 
 * @param {object} param1 
 * @param {('image'|'video')} param1.type
 * @param {Dimension} param1.dimensions
 * @returns {Promise<string>}
 */
async function getThumbnail(blobOrURL, { type, dimensions }) {

    /**
     * This method is used to retrieve the type of media to be expected from a given mime type
     * @param {string} mime 
     * @returns {('image'|'video')}
     */
    const getMediaType = (mime) => {
        return /video/.test(mime) ? 'video' : 'image'
    }


    const providers = [
        {
            regexps: [/youtube.com/gi, /youtu.be/gi],
            execute: async (url) => {
                //YouTube links have a much easier way to create the thumbnail
                let regexp = {
                    regular: /watch.*v=([a-zA-Z0-9]+)/i,
                    embed: /embed\/([a-zA-Z0-9]+)/i
                }
                let videoID;
                for (let reg in regexp) {
                    if (regexp[reg].test(url)) {
                        videoID = regexp[reg].exec(url)[1]
                        window.ri = regexp[reg]
                        window.uu = url
                    }
                }

                return `https://img.youtube.com/vi/${videoID}/mqdefault.jpg`
            }
        }

    ]

    let url;


    if (typeof blobOrURL !== 'string') { //Then blob input
        url = await readBlob(blobOrURL, { mode: 'url' })
        type ||= getMediaType(blobOrURL.type)
    } else {
        url = blobOrURL

        for (let provider of providers) {
            if (provider.regexps.some(reg => reg.test(url))) {
                return await provider.execute(`${url}`)
            }
        }

        if (!type) {

            try {
                const response = await fetch(url)
                const mimeType = response.headers.get('content-type')
                type = getMediaType(mimeType);
            } catch (e) {
                console.error(`Failed to normally create thumbnail for ${url}\n`, e)
                return url
            }
        }
    }


    /**
     * This method creates an element and waits for it to load
     * @param {('video'|'image')} type 
     * @param {number} tries If false, this will try creating the element with a different type
     * @returns {Promise<HTMLVideoElement|HTMLImageElement>}
     */
    async function createElement(type, tries) {

        let element = hc.spawn({
            tag: type === 'image' ? 'img' : 'video',
            attributes: {
                src: url,
                crossorigin: 'annonymous'
            }
        });

        if (element.tagName === 'VIDEO') {
            element.muted = true
        }


        //Now wait for the element to load
        await new Promise((resolve, reject) => {
            element.addEventListener('load', resolve)
            element.addEventListener('loadedmetadata', resolve)
            element.addEventListener('loadeddata', resolve)
            element.addEventListener('error', (err) => {
                //Try one more time with a different type
                if (tries <= 0) {
                    reject(err)
                } else {
                    createElement(type === 'image' ? 'video' : 'image', --tries).then((newElement) => {
                        element = newElement //The element has changed type, so let's update it
                        resolve()
                    }).catch(() => {
                        reject()
                    })
                }
            })

        })


        if (element.tagName === 'VIDEO') {
            element.currentTime = 1.5;
            await new Promise(x => setTimeout(x, 700))
        }


        return element
    }

    const element = await createElement(type, 3)


    const finalDimensions = scaleToMax({ width: element.videoWidth || element.width, height: element.videoHeight | element.height }, dimensions)

    return await elementScreenshot(element, dimensions, finalDimensions)

}


/**
 * This method is used to take a screenshot of an element
 * @param {HTMLElement} element 
 * @param {Dimension} canvasDimensions 
 * @param {Dimension} elementDimensions
 * @returns {Promise<string>}
 */
async function elementScreenshot(element, canvasDimensions, elementDimensions) {


    /** @type {HTMLCanvasElement} */
    const canvasElm = hc.spawn({
        tag: 'canvas',
        attributes: {
            style: `border: 1px solid red;`,
            width: canvasDimensions.width + 'px',
            height: `${canvasDimensions.height}px`
        }
    });
    const context = canvasElm.getContext('2d')
    context.clearRect(0, 0, canvasElm.width, canvasElm.height)
    context.save()

    await new Promise((resolve) => setTimeout(resolve, 100))

    canvasElm.width = canvasDimensions.width
    canvasElm.height = canvasDimensions.height

    context.drawImage(element, centralize(canvasElm.width, elementDimensions.width), centralize(canvasElm.height, elementDimensions.height), elementDimensions.width, elementDimensions.height);

    return await canvasElm.toDataURL()

}


/**
 * This calculates a mid-point between the two positions, useful for centralizing things.
 * @param {number} parent 
 * @param {number} child 
 * @returns {number}
 */
function centralize(parent, child) {
    return (parent - child) / 2
}



/**
 * @typedef {{
 *      width: number,
 *      height: number
 * }} Dimension
 */


/**
 * This method is used to scale a width/height dimension that favours the biggest of outcomes
 * @param {Dimension} input 
 * @param {Dimension} ideal 
 * @returns {Dimension}
 */
function scaleToMax(input, ideal) {



    // Final width and height of the image
    let width, height;


    //The width of the outcome given height
    const wh = input.width / input.height

    //The ration of the outcome height to the ideal width
    const hw = input.height / input.width



    switch (Math.max(input.width, input.height)) {

        case input.height:
            height = hw * ideal.width
            width = ideal.height
            break;

        case input.width:
            width = wh * ideal.height
            height = ideal.height
            break;
    }

    return { width, height }



}


const hcIO = {
    readBlob,
    elementScreenshot,
    getThumbnail,
}

export default hcIO