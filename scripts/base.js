'use strict';

function dblclick(fn) {
    return function(e) {
        if (e.target.dataset.dblclick === "false" || e.target.dataset.dblclick === undefined) {
            e.target.dataset.dblclick = "true";
            window.setTimeout(() => {
                e.target.dataset.dblclick = "false";
            }, 300);
        }
        else {
            e.target.dataset.dblclick = "false";
            fn();
        }
    }
}

function download(data, type, file_name) {
    var blob = new Blob([data], { "type": type });
    var elt = document.createElement("a");
    elt.href = URL.createObjectURL(blob);
    elt.style.display = "none";
    elt.download = file_name;
    main.appendChild(elt);
    elt.click();
    main.removeChild(elt);
}

class Fetch {
    static async fetchText(url) {
        const response = await fetch(url);
        const text = await response.text();
        return text;
    }
    static async fetchJSON(url) {
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }
    static async fetchFile(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        const result = URL.createObjectURL(blob);
        return result;
    }
}

export default { dblclick, download, Fetch };