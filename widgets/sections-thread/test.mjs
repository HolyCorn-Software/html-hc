/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * The sections-thread widget
 * This script controls a simple test page to demonstrate the working of the widget
 */

import { hc } from "../../lib/widget/index.mjs";
import SearchListPopup from "../search-list-popup/widget.mjs";
import SectionsThread from "./widget.mjs";

const sections = new SectionsThread();
document.body.appendChild(
    sections.html
);

sections.content = [
    {
        label: `hello`,
        html: hc.spawn({
            innerHTML: `This section is just about saying a great hello.<br>`.repeat(200)
        })
    },
    {
        label: `intro`,
        html: hc.spawn({
            children: [
                hc.spawn({
                    innerHTML: `The introduction to the concept.<br>`.repeat(200)
                }),
                new SearchListPopup(
                    {
                        doSearch: async (string) => {
                            return [
                                {
                                    image: '/$/shared/static/logo.png',
                                    label: `Some item`,
                                    value: 'item1'
                                },
                                {
                                    image: '/$/shared/static/logo.png',
                                    label: `A bean`,
                                    value: 'bean'
                                }
                            ]
                        },
                        listSize: { min: 2, max: 2 },
                        hideOnOutsideClick: false,
                        transformValue: async (val) => {
                            return {
                                image: '/$/shared/static/logo.png',
                                label: `Last: ${val}`,
                                value: val,
                            }
                        }
                    }
                ).html
            ]
        }),
    },
    {
        label: `A very long title.`,
        html: hc.spawn(
            {
                innerHTML: `This is something very very long<br>`.repeat(200)
            }
        )
    },
    {
        label: `Short`,
        html: hc.spawn({
            innerHTML: `Indeed, a short section.<br>`.repeat(200)
        })
    }
]


