/*
Copyright 2021 HolyCorn Software
The Inline Select widget

*/




import { Widget } from "../../lib/widget/index.mjs";
import { Erhi1d } from "./option.mjs";


// class renamed from InlineSelect to Abyydr01
export class Abyydr01 extends Widget {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.name
     * @param {string} param0.label
     * @param {{[key:string]:  string}} param0.values
     */
    constructor({ name, label, values, options } = {}) {

        super();

        super.html = document.spawn({
            classes: Abyydr01.classList,
            innerHTML: `
                <div class='container'>
                    <div class='label'></div>
                    <div class='top'>
                        <div class='title'>Click to expand</div>
                    </div>
                    <div class='detail'>
                        <div class='options'></div>
                    </div>
                </div>
            `
        })

        /** @type {string} */ this.title
        this.htmlProperty('.top >.title', "title", 'innerHTML');

        /** @type {string} */ this.label
        this.htmlProperty('.label', "label", 'innerHTML');

        this.html.$('.top').addEventListener('click', () => {
            this.visible = !this.visible;
        });

        /** @type {string} */ this.value
        let val;
        Reflect.defineProperty(this, 'value', {
            configurable: true,
            enumerable: true,
            get: () => val,
            set: v => {
                let option = this.options.filter(x => x.name === v)[0]

                if (!option) {
                    //If the caller is assigning a value that is non-existent
                    return;
                }
                val = v

                const animateNewTitle = async () => {


                    //We want a smooth animation from the current width to that produced by the new title.
                    const dimensions = {
                        old: undefined,
                        new: undefined
                    }

                    await new Promise(x => setTimeout(x, 100));

                    dimensions.old = this.html.$('.top >.title').getBoundingClientRect()
                    dimensions.new = [...this.html.$$(`.container >.detail >.options ${['', ...Erhi1d.classList].join('.')}`)].map(x => x.widgetObject).find(x => x.name === val).html.$(".container >.content").getBoundingClientRect()

                    this.html.classList.add('title-changed')


                    for (let param of ['width', 'height']) {
                        for (let type of ['new', 'old']) {
                            this.html.style.setProperty(`--${type}-title-${param}`, `${dimensions[type][param]}px`)
                        }
                    }
                    setTimeout(() => this.title = option.content, 350); //About half way into the animation

                    this.html.$('.container >.top >.title').addEventListener('animationend', () => {
                        this.html.classList.remove('title-changed')
                    }, { once: true })
                }

                animateNewTitle()

                this.dispatchEvent(new CustomEvent('change'));
            }
        })
        /** @type {function(('change'), CustomEvent, AddEventListenerOptions)} */ this.addEventListener

        /** @type {{name:string, content:string}[]} */ this.options
        this.pluralWidgetProperty({
            selector: `.hc-v2-inline-select-option`,
            parentSelector: `.detail .options`,
            property: 'options',
            transforms: {
                set: ({ name, content } = {}) => {
                    let widget = new Erhi1d({ name, content });
                    widget.html.addEventListener('click', () => {
                        this.value = widget.name
                        this.hide();
                    })
                    if (/^tall/i.test(content)) {
                        console.trace(`Setting ${name} = ${content}`)
                    }
                    return widget.html;
                },
                get: (html) => {
                    let widget = html.widgetObject;
                    return { name: widget.name, content: widget.content }
                }
            }
        });

        // /** @type {Erhi1d[]} */ this.optionWidgets
        // this.pluralWidgetProperty(
        //     {
        //         selector: `.hc-v2-inline-select-option`,
        //         parentSelector: `.detail .options`,
        //         property: 'optionWidgets',
        //         childType: 'widget'
        //     }
        // );


        /** @type {{[key:string]: string}} A different way of defining the options that the user has access to*/ this.values
        Reflect.defineProperty(this, 'values', {
            get: () => {
                let data = {}
                for (let option of this.options) {
                    data[option.name] = { content: option.content }
                }
                return data
            },
            set: data => {
                /** @type {typeof this.options} */
                let final = [];

                for (let option in data) {
                    final.push({ name: option, content: data[option] })
                }

                this.options = final;

                return final;
            },
            configurable: true,
            enumerable: true
        })

        Object.assign(this, arguments[0])

    }
    add({ name, content, label }) {
        this.options.push({ name, content: content || label })
    }


    async show() {
        //First make the expanded section to be drawable, however, not visible
        //Then get the dimensions of the section
        //Now make it visible but with zeroed dimensions
        //Gradually animate to it's real dimensions

        let html = this.html
        html.classList.add('frozen');
        let dimen = this.html.$('.container >.detail').getBoundingClientRect()

        //Now start animating
        html.classList.add('showing')
        html.classList.remove('frozen')

        //Set animation parameters
        for (let param of ['height', 'width']) {
            html.style.setProperty(`--inline-select-final-${param}`, `${dimen[param]}px`)
        }


    }

    async hide() {

        // The quite opposite of show()

        this.html.classList.add('hiding');
        this.html.addEventListener('animationend', () => {
            this.html.classList.remove('showing')
            this.html.classList.remove('hiding')
        }, { once: true })

    }

    get visible() {
        return this.html.classList.contains('showing');
    }
    set visible(tF) {
        if (Boolean(tF).valueOf() === false) {
            this.hide()
        } else {
            this.show();
        }
    }

    static get classList() {
        return ['hc-v2-inline-select']
    }

}
