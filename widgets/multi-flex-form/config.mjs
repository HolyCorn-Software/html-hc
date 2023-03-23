/*

Copyright 2021 HolyCorn Software
The MultiFlexForm Widget
This module allows different configurations of the layout
These configurations have names

For example, you can create a 'login' configuration whereby the widget has
    row1
    row2
Then row1 has
    email field
    password field
    login button

You can also create a signup configuration as such
    row1
        email
        password
        repeat password
    row2
        signup button

From there, you can load any configuration into the form

Take note of the put() and apply() methods

*/

import { MultiFlexFormField } from "./field.mjs";
import MultiFlexForm from "./flex.mjs";
import { MultiFlexFormItem } from "./item.mjs";
import { MultiFlexFormRow } from "./row.mjs";



export class MultiFlexFormConfiguration {


    constructor() {

        /**
         * Used internally.
         * @type {[{parent:MultiFlexFormItem, child:MultiFlexFormItem}]}
         */
        this.links = []
    }

    /**
     * Use this method remember that the element is a child of the parent.
     * If parent is not specified, then the child is a direct child of the form.
     * @param {MultiFlexFormItem} child
     * @param {MultiFlexFormItem} parent
     */
    put(child, parent) {
        if (!child) throw new Error(`Child cannot be undefined`)
        this.links.push(
            { parent, child }
        )
    }


    /**
     * Call this method to apply this configuration on a flex form
     * @param {MultiFlexForm} flexForm 
     */
    async apply(flexForm) {

        try { await flexForm.__customization_promise__ } catch { } //Wait for any previous customizations to finish

        flexForm.__customization_promise__ = new Promise(x => setTimeout(x, 200));//Mr Form... Stay on hold till we start the customization

        let time_difference = 200;

        if (typeof flexForm === 'undefined') {
            throw new Error(`Please pass a MultiFlexForm object`)
        }
        /**
         * What we do is...
         * 
         * Attach items at various levels, starting with the items that are attached to the root.
         * 
         * At each level, the elements of the level are put, then all elements that were not expressedly declared in the configuration,
         * but are children of the level, will be removed
         */

        //Do some touches on the links, and have a temporal copy we are going to use
        //The touching makes sure the elements with no parent, otherwise known as the root elements will have the current flexForm to be
        //their parent
        let links = this.links.map(x => {
            return { ...x, parent: x.parent || flexForm }
        })


        /** @param {MultiFlexFormItem} level*/
        let applyLevel = async (level) => {

            /** @param {MultiFlexFormItem} parent @returns {MultiFlexFormItem[]} */
            let legalChildrenOf = (parent) => {
                //This method gives us the sub-elements that belong to a parent.
                //That is the sub-elements that have been declared in the configuration.
                return links.filter(x => x.parent == parent).map(x => x.child)
            }


            //First remove the imposters
            let legalChildren = legalChildrenOf(level);

            if (legalChildren.length > 0) { //That is, if we even have records about this widget having children

                for (var child of level.items) {
                    if (legalChildren.indexOf(child) == -1) {
                        //If illegitimate 
                        await child?.remove();
                    }
                }


                //Then add the real children

                for (var _legalChild of legalChildren) {
                    let legalChild = _legalChild
                    await new Promise(proceed => {
                        setTimeout(() => {
                            proceed()
                        }, legalChild instanceof MultiFlexFormField ? time_difference : 0)
                    })
                    MultiFlexFormItem.put(legalChild, level);

                }


                for (var legalChild of legalChildren) {
                    await applyLevel(legalChild);
                }

            }




            //Think about the algorithm, especially why we check for the presence of legal children.
            //Think about it like this...
            //We want to go deeper into the tree
            //However, we don't know if one extra level is dangerous. What we mean by dangerous is this...
            //Going so deep into the tree that we start removing internal HTML elements such as img, br, which are completely innocent of flex configurations
            //The way we know when to stop is if the level is not declared in our structure as having any children

        }

        let start = Date.now()
        flexForm.__customization_promise__ = applyLevel(flexForm);
        await flexForm.__customization_promise__;
        console.log(`Done with Config application. It took ${Date.now() - start}ms`)

    }



    /**
     * This method is used to quickly create a MultiFlexFormConfiguration simply by defining field names,
     * as well as types and labels.
     * 
     * Example 
     * ```js
     * [
     * 
     *      //The elements of this array will be shown on row one
     *      [
     *           {
     *               name:'names',
     *               label:'Names',
     *          //'choose','password', 'text', 'date', or leave blank
     *               type:'text'
     *           },
     *           {
     *               name:'sex'
     *               label:'Sex',
     *               type:'choose', //meaning a finite list of values
     *               values:{ //Therefore we specify that finite list
     *                   M:'Male', //M is value, 'Male' is the label
     *                   F:'Female'
     *               }
     *           }
     *      
     *      ],
     *      
     *      //Row 2
     *      [
     *           {
     *               name:'phone',
     *               label:'Phone',
     *               type:'text'
     *           },
     *           {
     *               name:'email'
     *               label:'Email',
     *               type:'text'
     *           }
     *      
     *      ]
     * 
     * ]
     * ```
     * 
     * 
     * 
     * @param { import("./types.js").MultiFlexFormDefinitionData } data 
     * @param {string} callerUrl
     * @returns {MultiFlexFormConfiguration}
     */
    static quickCreate(data, callerUrl) {

        let config = new this()

        for (var row_data of data) {

            let row = new MultiFlexFormRow()

            for (var field_data of row_data) {
                if (field_data.customWidgetUrl && callerUrl) {
                    field_data.customWidgetUrl = new URL(field_data.customWidgetUrl, callerUrl).href;
                }
                let { label, values, value, name, ...rest } = field_data
                let field = new MultiFlexFormField(rest)
                field.setType(field_data.type, { ...field_data })
                value && (field.value = value)
                config.put(field, row)
            }

            config.put(row)

        }

        return config;


    }



}