//Share uniqueID generator between field.js component and generator.jsx page.
let uniqueId = 0;

export function getUniqueId() {
    return ++uniqueId;
}
