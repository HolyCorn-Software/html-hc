/**
 * Copyright 2022 HolyCorn Software
 * Adapted from HC version 1 (uCheckbox.js)
 */
import { hc } from "../../lib/widget/index.mjs";
import { Widget } from "../../lib/widget/index.mjs";

export class Checkbox extends Widget {
    constructor() {
        super();

        super.html = hc.spawn({
            classes: ["hc-uCheckbox"],
            innerHTML: "<div class='content'></div>"
        });

        this.html.addEventListener("click", function () {
            this.checked = !this.checked
        }.bind(this))

        Object.defineProperty(this.html, "checked", {
            get: () => this.checked,
            set: state => this.checked = state
        })

        /** @type {function(('change'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener
    }
    /**
     * @param {boolean} checked
     */
    set checked(checked) {
        checked = Boolean(checked)
        this.html.classList.toggle("checked", checked)
        this.html.classList.toggle("unchecked", !checked)
        this.dispatchEvent(new CustomEvent("change"))
        this.html.dispatchEvent(new CustomEvent("change"))
    }
    get checked() {
        return this.html.classList.contains("checked")
    }
    get value() {
        return this.checked
    }
    set value(e) {
        this.checked = e
    }
    set silent_value(v) {
        v = Boolean(v)
        this.html.classList.toggle('checked', v)
        this.html.classList.toggle('unchecked', !v)
    }
    set content(content) {
        content = document.spawn({
            innerHTML: content
        });
        this.html.$(".content").children[0]?.remove()
        this.html.$('.content').appendChild(content)
    }
    get content() {
        try {
            return this.html.$(".content").children[0]
        } catch (e) { }
    }

    static get classList() {
        return ['hc-uCheckbox']
    }
}
hc.importModuleCSS(import.meta.url);
