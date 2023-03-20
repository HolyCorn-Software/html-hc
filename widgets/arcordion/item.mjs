/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget is part of the Accordion widget and it represents a single item
 */

import { hc, Widget } from "../../lib/widget/index.mjs";



/**
 * @template ContentWidget
 */
export default class AccordionItem extends Widget {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.label
     * @param {import("../../lib/widget/types.js").ExtendedHTML<ContentWidget>} param0.content
     */
    constructor({ label, content } = {}) {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-accordion-item'],
            innerHTML: `
                <div class='container'>
                    <div class='header'>
                        <div class='label'>Create Contribution</div>
                        <div class='fold-icon'></div>
                    </div>

                    <div class='content-section'>
                        <div class='content'>
                            Bla bla bla
                        </div>
                    </div>
                    
                </div>
            `
        });

        /** @type {string} */ this.label
        this.htmlProperty(".container .header >.label", "label", "innerHTML");

        /** @type {import("../../lib/widget/types.js").ExtendedHTML<ContentWidget>} */ this.content
        this.widgetProperty({
            selector: '*',
            parentSelector: '.container >.content-section',
            property: 'content',
            childType: 'html'
        })

        this.html.$('.header').addEventListener('click', () => {
            setTimeout(() => {
                this.expanded = !this.expanded
            }, 150);
            this.dispatchEvent(new CustomEvent('expand-change'))
        })

        /** @type {function(('expand-change'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        Object.assign(this, arguments[0])
    }

    /**
     * This determines whether or not the item is expanded
     * @param {boolean} value
     */
    set expanded(value) {
        (async () => {

            if (value === this.expanded) {
                return;
            }

            this[item_expanded_symbol] = value;

            if (value) {
                //The logic of expanding an item works thus...
                //We replace the content section with a duplicate of it
                //We now make the content section a ghost, and add it back to the container
                //Now that it is added, we now calculate the full height of the content section
                //We take note of this height value
                //We now replace the replacement with what was originally there (content section)
                //We now animate an expansion from the height of zero to our calculated height.
                //The reason we do it like this is because we need the full height of the content section for a smooth animation 
                let content_section = this.html.$('.content-section')
                let replacement = content_section.cloneNode(true);

                const initial_height = content_section.getBoundingClientRect().height

                const em = (val) => /^[0-9]+/.exec(window.getComputedStyle(content_section).fontSize)[0] * val

                content_section.replaceWith(replacement)

                content_section.classList.add('hc-cayofedpeople-accordion-item-ghost')

                this.html.appendChild(content_section);


                //Here, we wait till we've been able to calculate the element's new height
                await new Promise(ok => {
                    const done = () => {
                        setTimeout(ok, 200);
                        clearInterval(interval);
                    }
                    const interval = setInterval(() => {
                        const current_height = content_section.getBoundingClientRect().height
                        if (current_height !== initial_height) {
                            done()
                        }
                    }, 1)

                    setTimeout(done, 50);

                })

                let rect = content_section.getBoundingClientRect();

                this.html.style.setProperty('--full-height', `${rect.height + em(5)}px`)

                content_section.remove()
                replacement.replaceWith(content_section)

                setTimeout(() => {
                    this.html.classList.add('expanded')
                    content_section.classList.remove('hc-cayofedpeople-accordion-item-ghost')
                }, 1);
            } else {
                this.html.classList.remove('expanded');
            }

        })()
    }

    /**
     * Tells us if the UI is expanded
     * @returns {boolean}
     */
    get expanded() {
        return this.html.classList.contains('expanded');
    }

}


const item_expanded_symbol = Symbol(`AccordionItem.prototype.expanded`)