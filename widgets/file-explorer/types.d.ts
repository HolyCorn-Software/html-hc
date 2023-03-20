/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * 
 * This module is part of the file-explorer widget and contains type definitions used by it
 * 
 */

import { AlarmObject } from "../../lib/alarm/alarm-types";
import DirectoryWidget from "./item/widget.mjs";


export declare interface DirectoryData {
    id: string
    label: string
    parent: string
    icon: string
    navigable: boolean
    onselect: () => void
    actions: Omit<FileExplorerAction, "locations">[]
    custom_html: HTMLElement

}


export type FileExplorerStateData = AlarmObject<{ items: DirectoryData[], current_path: string, loading_items: string[] }>


export declare interface FileExplorerParams {

    /** @deprecated Either use the on_create_action() method, and return the items that will be added, or directly add the actions to the items themselves */
    actions: FileExplorerAction[]
    /** Override this method to dynamically add items to the widget under certain conditions. The click_item parameter is the item that was clicked to navigate to the new path */
    on_create_action: (click_item: DirectoryData) => FileExplorerAction[], //This method is called when the system navigates into a path. It returns the actions that are supposed to be added as a result of that navigation
}

export declare interface FileExplorerAction {
    label: string,
    onclick: (abc: DirectoryWidget) => undefined,
    locations: FileExplorerActionLocation[],
}


export type FileExplorerActionLocation = ('global_root' | 'global_noneroot')