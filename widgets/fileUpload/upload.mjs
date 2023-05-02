

import { Widget } from '../../lib/widget/index.mjs'
import { hc } from '../../lib/widget/index.mjs'
import Spinner from '../infinite-spinner/widget.mjs';
import hcIO from '../../lib/util/io.mjs';
import ActionButton from '../action-button/button.mjs';

hc.importModuleCSS(import.meta.url);

/**
 * @typedef {function('error'|'change'|'fileselected')} EventCallback
 */

export class UniqueFileUpload extends Widget {



    /**
     * 
     * @param {object} param0
     * @param {string} param0.label
     * @param {string} param0.url
     * @param {string} param0.mimeType
     * @param {number} param0.maxSize
     */
    constructor({ label, mimeType, maxSize, url } = {}, paramString) {

        super();

        super.html = document.spawn({
            class: 'hc-uniqueFileUpload',
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <div class='label'></div>
                        <input type='file'>
                        <img>
                    </div>

                    <div class='actions'>
                        <div class='confirm'></div>
                        <div class='cancel'></div>
                    </div>
                    
                </div>
            `
        });

        let originalLabel //original because it is set once
        this.htmlProperty('.label', 'label', 'innerHTML', label => {
            originalLabel ||= label
        })

        this.htmlProperty('input', 'fileType', 'attribute')

        /** @type {string} */ this.image_url
        Reflect.defineProperty(this, 'image_url', {
            get: () => this.html.$('.container >.main >img').src,
            set: (value) => {
                this.html.$('.container >.main >img').src = value
                this.html.classList.add('image-is-set')
                this.html.style.setProperty('--hover-image', `url('${value}')`)
            }
        })


        let confirm = new ActionButton({
            content: 'Confirm'
        })
        confirm.onclick = this.doUpload.bind(this)

        let cancel = new ActionButton({
            content: 'Cancel'
        })
        cancel.onclick = () => {
            this.empty = true;
            this.value = this.value
        }

        this.html.$('.confirm').appendChild(confirm.html)
        this.html.$('.cancel').appendChild(cancel.html)

        this.html.$('.main').addEventListener('click', () => {
            this.html.$('input').click();
        });





        Object.assign(this, arguments[0])

        if (!this.label) {
            this.label = 'Click to Select'
        }

        if (paramString) {
            this.paramString = paramString; //In a form e.g MultiFlexForm, it is the type attribute that is being used
        }

        /** @type {EventCallback} */ this.addEventListener
        /** @type {EventCallback} */ this.addEventListener
        /** @type {string} */ this.mimeType
        /** @type {string} */ this.url

        /** @type {string} */ this.value
        let thisDotValue;
        let file_remove_timeout;
        Reflect.defineProperty(this, 'value', {
            set: (v) => {
                thisDotValue = v
                this.dispatchEvent(new CustomEvent('change'));
                this.refresh_image();
                clearTimeout(file_remove_timeout)
                file_remove_timeout = setTimeout(() => {
                    this.html.classList.remove('hasFile')

                    /** @type {ActionButton} */
                    let button = this.html.$('.confirm').children[0].object
                    button.state = 'initial'
                }, 2000)
            },
            get: () => thisDotValue,
            configurable: true,
            enumerable: true
        })


        //Manipulating this property will hide and show specific parts of the UI, which can either allow or stop the user from uploading
        /** @type {boolean} */ this.empty
        Reflect.defineProperty(this, 'empty', {
            get: () => this.fileInput.value === '',
            set: (v) => {
                this.html.classList.toggle('hasFile', !v)
                //The following calculations on the max number of characters in the name, is based on the width occupied by a single character (16), and the space already taken off the main widget
                this.label = !v ? UniqueFileUpload.getShortName(this.fileInput.files?.[0]?.name || `...`, Math.floor((this.html.$('.container').getBoundingClientRect().width - 72) / 16)) : originalLabel;
                if (!v) return
                confirm.state = ''
                this.fileInput.value = ''
            }
        })

        //When the file input changes, we apply the change to the actual widget
        this.fileInput.addEventListener('change', () => {
            this.dispatchEvent(new CustomEvent('fileselected'))
        })


        // When the value of the widget changes, decide whether or not the input value is empty, and so allow or disallow uploads
        //As well as place the tiny image preview
        this.addEventListener('fileselected', () => {

            //Enable or disable the options (upload and cancel)
            this.empty = this.fileInput.value === ''

            this.refresh_image()

        })

    }

    /**
     * This method makes sure the icon shown on the widget reflects the value of the widget
     */
    refresh_image() {

        const setThumbnail = async (urlOrBlob) => {

            try {
                this.image_url = await hcIO.getThumbnail(urlOrBlob, { dimensions: { width: 500, height: 280 } })
            } catch (e) {
                console.log(e)
            }

        }

        if (this.fileInput.files.length > 0) {
            let reader = new FileReader()
            reader.readAsDataURL(this.fileInput.files[0])
            this.mimeType = this.fileInput.files[0].type

            reader.onloadend = async () => {
                setThumbnail(this.fileInput.files[0])
            }


        } else {
            setThumbnail(this.value)
        }
    }

    /**
     * For example uniqueFileUpload(dW5kZWZpbmVk)
     * Or uniqueFileUpload(<any-param-string>)
     * 
     * Check the methods decodeParamString() and encodeToParamString() to know exactly how the paramString is created is to be formatted
     */
    set type(type) {
        //Knowing that is set from a form like MultiFlexForm
        this.paramString = /\((.+)\)$/.exec(type)?.[1]
    }
    get type() {
        return `uniqueFileUpload${this.paramString})`
    }


    /**
     * @returns {HTMLInputElement}
     */
    get fileInput() {
        return this.html.$('input')
    }

    /**
     * Use a param string to set properties on this widget
     */
    set paramString(string) {
        //The params set the following attributes
        //  url
        //  maxSize
        //  type
        if (!string) {
            return console.trace('null param string')
        }
        let object = UniqueFileUpload.decodeParamString(string)
        let { url, maxSize, type } = object
        Object.assign(this, { url, maxSize, type })
    }

    get paramString() {
        //Remember that only url, maxSize and type are important to param strings
        return UniqueFileUpload.encodeToParamString(
            ({ url, maxSize, type }) => ({ url, maxSize, type })(this)
        )

    }

    async doUpload() {

        let file = this.html.$('input').files[0]

        let formData = new FormData();
        formData.append('file', file);

        /** @type {ActionButton} */
        let button = this.html.$('.confirm').children[0].object
        button.state = 'waiting';


        try {
            let reply = (await fetch(this.url, {
                method: 'POST',
                body: formData
            }))

            if (reply.status !== 200) {

                throw new Error(`code: ${reply.statusText} (${reply.status})\n${await reply.text()}`)
            }
            this.value = (await reply.json()).url
        } catch (e) {
            this.dispatchEvent(new CustomEvent('error', { detail: e }))
            button.state = ''
            alert(`Error\n${e}`)
            console.log(`errr`, e)
            return;
        }

        button.state = 'success'

    }

    #spinner = new Spinner()
    set waiting(state) {
        if (state) {
            this.#spinner.start()
            this.#spinner.attach(this.html)
        } else {
            this.#spinner.detach()
            this.#spinner.stop()
        }
    }
    get waiting() {
        return this.#spinner.isAttached
    }

    /**
     * This shortens a name like 'profile photo of me in the beach.jpg' to 'profile...jpg'
     * @param {string} name 
     * @param {number} maxLength 
     * @returns {string}
     */
    static getShortName(name, maxLength) {
        if (name.length <= maxLength) return name
        if (maxLength < 6) {
            throw new Error('Cannot shorten name to a length less than six(6)')
        }
        return `${name.substring(0, maxLength - 6)}...${name.substring(name.length - 3, name.length)}`
    }

    /**
     * A param string is a Base-64 encoded JSON representation of an object, that's meant to be used as parameters to a function.
     * @param {string} string 
     */
    static decodeParamString(string) {
        return JSON.parse(
            window.atob(string)
        )
    }

    static encodeToParamString(object) {
        return window.btoa(
            JSON.stringify(
                object
            )
        )
    }

}