/*
Copyright 2021 HolyCorn Software
This widget allows us to set a waiting state on the Action Button
*/

import { hc } from "../../../../lib/widget/index.mjs";
import Spinner from "../../../infinite-spinner/widget.mjs"
import ActionButton from "../../button.mjs";

const spinnerStorageKey = Symbol(`Waiting state spinner storage key`)

hc.importModuleCSS(import.meta.url);

export default {

    /** 
     * @param {ActionButton} widget
     */
    async set(widget) {
        const spinner = widget[spinnerStorageKey] = new Spinner();
        spinner.start();
        spinner.attach(widget.html.$('.overlay'))
    },
    async unset(widget) {
        const spinner = widget[spinnerStorageKey]
        spinner.detach()
        await new Promise(p => setTimeout(p, 500))
        spinner.stop()
    }

}