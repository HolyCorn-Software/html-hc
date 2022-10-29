/**
 * Copyright 2022 HolyCorn Software
 * 
 * This module contains useful functions used by the file-explorer widget
 */

/**
 * Returns all the directories directly existing within the named directory
 * @param {string} directory_id 
 * @param {[import("./types.js").DirectoryData]} directory_data
 * @returns {[import("./types.js").DirectoryData]}
 */
export function getImmediateChildren(directory_id, directory_data) {

    let children = directory_data.filter(dir => dir.parent === directory_id)

    if (children.length === 0) {
        if (!directory_data.filter(dir => dir.id === directory_id)[0]) {
            // throw new Error(`Technical Error\ndirectory "${directory_id}" not found`)
            return []

        }
    }

    return children
}

/**
 * Deletes an item as well as everything below it
 * @param {string} directory_id 
 * @param {[import("./types.js").DirectoryData]} directories_data 
 */
export function deleteItem(directory_id, directories_data) {
    return directories_data.filter(item => {
        if (item.parent === directory_id || item.id === directory_id) {
            return false;
        }
        return true;
    })
}




/**
 * Returns an array representing the directory that contains the directory that contains the directory ... that contains the specified directory.
 * 
 * That is, from the root directory, what directory are the direct descendants that eventually contain the specified directory
 * @param {string} directory_id 
 * @param {[import("./types.js").DirectoryData]} directory_data
 * @returns {[import("./types.js").DirectoryData]}
 */
export function getRootPath(directory_id, directory_data) {

    let current_directory_id = directory_id;
    let path = []

    while (current_directory_id !== '') {
        let the_path = directory_data.filter(dir => dir.id === current_directory_id)[0]
        if (!the_path) {
            break;
        }

        path.push(the_path)

        current_directory_id = the_path.parent;

    }

    return path.reverse();

}