/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This widget (sections-thread), is a kind of UI, where the user can consume content
 * that is segmented according to, "sections". These sections are labelled, and
 * as the user passes over a section, it is highlighted on a map
 */


import DelayedAction from "../../lib/util/delayed-action/action.mjs";
import Map from "./map/widget.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
/**
 * This widget (sections-thread), is a kind of UI, where the user can consume content
 * that is segmented according to, "sections". These sections are labelled, and
 * as the user passes over a section, it is highlighted on a map 
 * @extends Widget<SectionsThread>
 */
export default class SectionsThread extends Widget {


    constructor() {

        super();


        super.html = hc.spawn({
            classes: SectionsThread.classList,
            innerHTML: `
                <div class='container'>
                    <div class='map'></div>
                    <div class='content'></div>
                </div>
            `
        });

        const label = Symbol();

        let ignoreScroll;


        const observer = new IntersectionObserver(
            (entries) => {
                if (ignoreScroll) {
                    return;
                }
                const selected = entries.filter(x => x.isIntersecting).sort(
                    (a, b) => {
                        return a.intersectionRatio > b.intersectionRatio ? 1
                            : a.intersectionRatio < b.intersectionRatio ? -1
                                : 0
                    }
                ).map(
                    ent => this[content].findIndex(
                        x => x == ent.target
                    )
                )[0];

                if (typeof selected !== 'undefined') {
                    this.map.selections = [selected];
                }

            }
        );


        /** @type {htmlhc.widget.sectionsthread.Item[]} */ this.content;
        this.pluralWidgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.content',
                property: 'content',
                transforms: {
                    set: (data) => {
                        data.html[label] = data.label
                        this.waitTillDOMAttached().then(() => {

                            observer.observe(data.html)
                            /** @type {(keyof HTMLElementEventMap)[]} */
                            const events = ['mousemove', 'mousedown', 'touchstart']
                            for (const event of events) {
                                data.html.addEventListener(event, () => {
                                    const index = this[content].findIndex(x => x == data.html)
                                    if (index !== -1) {
                                        this.map.selections = [index]
                                    }
                                }, { passive: true })
                            }

                        })
                        return data.html
                    },
                    get: (html) => {
                        return {
                            label: html[label],
                            html: html
                        }
                    }
                },
                onchange: new DelayedAction(() => {
                    this.map.items = this.content.map(x => x.label)
                }, 250)
            }
        );

        const content = Symbol()

        /** @type {HTMLElement&{[label]: string}[]} */ this[content];

        this.pluralWidgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.content',
                property: content,
                childType: 'html'
            }
        );

        this.widgetProperty(
            {
                selector: ['', ...Map.classList].join('.'),
                parentSelector: '.container >.map',
                property: 'map',
                childType: 'widget',
            }
        );
        /** @type {Map} */ this.map = new Map();

        const restoreScroll = new DelayedAction(() => {
            ignoreScroll = false
        }, 1200)

        this.map.addEventListener('change', () => {
            const selected = this.map.selections[0];
            this.content[selected]?.html?.scrollIntoView({ behavior: 'smooth' })
            ignoreScroll = true
            restoreScroll()
        });


        hc.watchToCSS(
            {
                source: this.map.html,
                target: this.html,
                apply: `--map-width`,
                watch: {
                    dimension: 'width'
                }
            }
        );


        hc.watchToCSS(
            {
                source: this.map.html,
                target: this.html,
                apply: `--map-height`,
                watch: {
                    dimension: 'height'
                }
            }
        );



    }


    /**
     * @readonly
     */
    static get classList() {
        return ['hc-sections-thread'];
    }
}