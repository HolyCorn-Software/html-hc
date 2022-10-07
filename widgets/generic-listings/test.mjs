/**
 * Copyright 2022 HolyCorn Software
 * This page is used to test the generic-listings widget
 */

import { hc } from "../../lib/widget/index.mjs";
import GenericListings from "./widget.mjs";


document.body.appendChild(new GenericListings().html)

hc.importModuleCSS()