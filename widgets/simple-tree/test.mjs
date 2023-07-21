/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * The simple-tree widget
 * This script controls a simple test page to demonstrate the working of the widget
 */

import { hc } from "../../lib/widget/index.mjs";
import SimpleTree from "./widget.mjs";



const tree = new SimpleTree(
    [
        {
            label: `Abraham`,
            id: 'abram',
            icon: `/$/shared/static/logo.png`,
            parent: undefined
        },
        {
            label: `Dumbledore`,
            id: 'dumbledore',
            icon: `/$/shared/static/logo.png`,
            parent: 'abram'
        },
        {
            label: `Uncle Cales`,
            id: 'unclecales',
            parent: 'uncleben',
            icon: '/$/shared/static/logo.png'
        },
        {
            label: `Einstein`,
            id: 'einstein',
            parent: 'abram',
            icon: '/$/shared/static/logo.png'
        },
        {
            label: `Newton`,
            id: 'newton',
            parent: 'abram',
            icon: '/$/shared/static/logo.png'
        },
        {
            label: `Uncle ben`,
            id: 'uncleben',
            parent: 'abram',
            icon: '/$/shared/static/logo.png'
        },
        {
            label: `Tesla`,
            id: 'tesla',
            parent: 'abram',
            icon: '/$/shared/static/logo.png'
        },
        {
            label: `Rockafella`,
            id: 'rockafella',
            parent: 'abram',
            icon: '/$/shared/static/logo.png'
        },
        {
            label: `Son of Binary`,
            id: 'sonofbinary',
            parent: 'einstein',
            icon: '/$/shared/static/logo.png'
        },
        {
            label: `Mr Daniel`,
            id: 'mrdaniel',
            parent: 'rockafella',
            icon: '/$/shared/static/logo.png'
        },
        {
            label: `HolyCorn Software`,
            id: 'holycorn',
            parent: 'sonofbinary',
            icon: '/$/shared/static/logo.png'
        },
        {
            label: `TRANZAK`,
            id: 'tranzak',
            parent: 'mrdaniel',
            icon: '/$/shared/static/logo.png'
        },
        {
            label: `Matazm`,
            id: 'matazm',
            parent: 'holycorn',
            icon: '/$/shared/static/logo.png'
        },
        {
            label: `Matazm French`,
            id: 'matazm-french',
            parent: 'matazm',
            icon: '/$/shared/static/logo.png'
        },
        {
            label: `CAYOFED People System`,
            id: 'cayofedpeople',
            parent: 'holycorn',
            icon: '/$/shared/static/logo.png'
        }
    ]
);


document.body.appendChild(
    tree.html
)