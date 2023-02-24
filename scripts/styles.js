'use strict';

import Base from './base.js';

class Styles {
    static root = document.querySelector(":root");
    static getStyles(stylesConfig) {
        var styles = window.getComputedStyle(this.root, null);
        var result = "{\n";
        for (const i of styles) {
            if (i.match("--")) {
                result += `    "${i.replace("--", "")}": "${styles.getPropertyValue(i)}",\n`;
            }
        }
        if (result == "{\n") {
            for (const keyValue of Object.entries(stylesConfig)) {
                var value = window.getComputedStyle(document.querySelector(keyValue[1][0])).getPropertyValue(keyValue[1][1]);
                if (keyValue[1][2] && keyValue[1][3]) {
                    if (keyValue[1][2] == "color") {
                        result += `    "${keyValue[0]}": "${value.match(/(rgb\(..?.?, ..?.?, ..?.?\))|(rgba\(..?.?, ..?.?, ..?.?, ..?.?\))/g)[keyValue[1][3]]}",\n`;
                    }
                }
                else {
                    result += `    "${keyValue[0]}": "${value}",\n`;
                }
            }
        }
        result += "}";
        result = result.replace(",\n}", "\n}");
        return result;
    }
    static parseStyles(style, stylesConfig) {
        // 解析样式
        var text = JSON.parse(style);
        var commitStyles = "";
        // 防止用户提交非法样式
        for (const [key, value] of Object.entries(text)) {
            for (const data of Object.entries(stylesConfig)) {
                if (key == data[0]) {
                    commitStyles += `--${key}: ${value};`;
                }
            }
        }
        this.root.setAttribute("style", commitStyles);
    }
    static colorDepth(hex) {
        hex = hex.split("#")[1];
        var r = parseInt(`${hex[0]}${hex[1]}`, 16);
        var g = parseInt(`${hex[2]}${hex[3]}`, 16);
        var b = parseInt(`${hex[4]}${hex[5]}`, 16);
        if (r + g + b < 382) {
            return true;
        }
        else {
            return false;
        }
    }
    static downloadStyles(stylesConfig) {
        var style = Styles.getStyles(stylesConfig);
        Base.download(style, "application/json", "styles.json");
    }
    static setProperty(property_name, value) {
        this.root.style.setProperty(property_name, value);
    }
}

export default Styles;