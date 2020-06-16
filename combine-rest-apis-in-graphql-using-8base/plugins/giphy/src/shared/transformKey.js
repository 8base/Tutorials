/**
 * Transform the key value of a nested object key.
 * 
 * @param {object} obj 
 * @param {array[string]} path 
 * @param {string} newKey 
 */
export default function transformKey (obj, path, newKey) {
    if (path.length === 1) {
        obj[newKey] = obj[path]
        delete obj[path];
        return
    }
    return transformKey(obj[path[0]], path.slice(1), newKey)
}