'use strict';

// 变量声明与赋值

// AudioContext
const AudioContext = window.AudioContext || window.webkitAudioContext; // 适配较老的浏览器
const audioContext = new AudioContext();

// 主元素(非根元素)
const main = document.getElementById("main");

// 全屏模式方法
const exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen;
const fullScreen = main.requestFullscreen || main.mozRequestFullScreen || main.webkitRequestFullscreen;

// 播放相关元素
const playButton = document.getElementById("play");
const togglePlay = document.getElementById("toggleplay");
const playIcon = document.getElementById("play-icon");

// 音频文件上传相关元素
const fileElement = document.getElementById("files");
const audioFileButton = document.getElementById("audio-file-btn");

// 音频源元素
const audioElement = document.getElementById("audio");

// 显示或隐藏菜单的相关元素
const ctrlMenu = document.getElementById("showmenu");
const toggleMenu = document.getElementById("togglemenu");

// 进入或退出全屏模式的相关元素
const ctrlFullscreen = document.getElementById("fullscreen");
const fullscreenIcon = document.getElementById("fullscreen-icon");
const toggleFullscreen = document.getElementById("togglefullscreen");

// 重新播放音频的相关元素
const replay = document.getElementById("replay");
const toggleReplay = document.getElementById("togglereplay");

// 各个窗口、标题栏和按钮
const windows = document.getElementsByClassName("window");
const showWindows = document.getElementsByClassName("showwindow");
const closeWindows = document.getElementsByClassName("close");
const toolbars = document.getElementsByClassName("toolbar");
const maximizeWindows = document.getElementsByClassName("maximum");

// 菜单元素
const menu = document.getElementById("menu");

// FileReader
const reader = new FileReader();

// Date
const date = new Date();

// 音量增益节点
const gain = audioContext.createGain();

// 音频源节点
const track = audioContext.createMediaElementSource(audioElement);

// 记录第一次点击，用于双击判断
const prevClick = { play: 0, fullscreen: 0, menu: 0, replay: 0 };

// 根元素(非主元素)
const root = document.querySelector(":root");

// 颜色选择器元素
const colorPickers = document.getElementsByClassName("colorpicker");

// 背景颜色选择器元素
const backgroundColorPickers = document.getElementsByClassName("bgcolorpicker");
// 背景颜色自定义选择器元素
const backgroundColorSelector = document.getElementById("bgcolorselect");

// 背景类型选择器元素
const staticColor = document.getElementById("static-color");
const linearGradient = document.getElementById("linear-gradient");

// 渐变色相关参数选择元素
const linearGradientTo = document.getElementById("gradient-to");
const linearGradientFrom = document.getElementById("gradient-from");
const linearGradientOptions = document.getElementsByClassName("linear-gradient-option");
const linearGradientColors = document.getElementById("linear-gradient-colors");
let LinearGradientDirection = "top";
// 为渐变色添加颜色的按钮元素
const linearGradientAddColor = document.getElementById("addcolor");

// 是否启用窗口拖拽
var useDragging = true;

// 是否启用强制窗口最大化
var alwaysFullscreen = false;

// 获取样式配置按钮元素
const getStylesButton = document.getElementById("getstyles");
// 高级样式编辑元素
const styleEditor = document.getElementById("style-editor");
// 提交更改样式
const commitButton = document.getElementById("commit");
// 下载当前样式配置
const downloadStylesButton = document.getElementById("downloadstyles");

// 窗口容器
const windowContainer = document.getElementById("windows");

// 音频播放进度条容器
const progressContainer = document.getElementById("progress-container");
// 音频播放进度条
const progressBar = document.getElementById("progress");
// 用于存储更新音频播放进度条定时事件的变量
var progressing;

// 选择背景类型的元素
const backgroundType = document.getElementsByClassName("background-type");

// 颜色主题容器
const colorTheme = document.getElementById("color-theme");

// 刷新颜色主题的元素
const refreshStyles = document.getElementById("refresh-styles");

//颜色选择器的颜色列表
const colorList = [
    "red",
    "orange",
    "yellow",
    "green",
    "cyan",
    "blue",
    "purple",
    "black",
    "white",
]

// 默认域
var domain;
// 默认颜色主题仓库(目录)名称
var stylesRepoName;
// 样式配置表
var stylesConfig;
(async function () {
    // 获取配置文件
    const config = await fetchJSON('configs/config.json');
    const styleConfigData = await fetchJSON('configs/style_configs.json');
    // 配置默认域
    domain = config.domain;
    // 配置颜色主题仓库(目录)名称
    stylesRepoName = config.style_repo_name;
    // 配置样式表
    stylesConfig = styleConfigData;
    getStylesStore();
})();

// 绑定事件监听器
for (const elt of backgroundColorPickers) {
    elt.addEventListener("click", setBackgroundColor);
}

setPickerColor();

// 绑定背景类型选择元素选择事件
for (const elt of backgroundType) {
    elt.addEventListener("mousedown", chooseBackground);
}

// 绑定线性渐变色方向下拉列表选项选择事件
for (const elt of linearGradientOptions) {
    elt.addEventListener("mousedown", selectLinearGradientDirection);
}

// 绑定自定义背景色选择器数值变动时的设置颜色时间
backgroundColorSelector.addEventListener("change", selectorColor);

// 绑定播放按钮元素点击后播放音频的事件
playButton.addEventListener("click", play);
// 绑定双击操作播放元素双击后播放音频的事件
togglePlay.addEventListener("mousedown", dblclick(play, "play"));

// 绑定音频播放结束后的事件
audioElement.addEventListener("ended", () => {
    playButton.dataset.playing = "false";
    playIcon.className = "fa fa-play";
    // 重置进度条
    //restartProgress()
});

/*reader.addEventListener("loadend", () => {
    console.log("解析完毕");
    audioElement.src = reader.result;
    // track = audioContext.createMediaElementSource(audioElement);
    track.connect(audioContext.destination);
    track.connect(gain).connect(audioContext.destination);
});*/

// 绑定音频文件选择元素获取到文件时解析的事件
fileElement.addEventListener("change", () => {
    // 暂停
    audioElement.pause();
    playButton.dataset.playing = "false";
    playIcon.className = "fa fa-play"
    console.log("开始解析");
    // 解析为Blob
    var audioUrl = URL.createObjectURL(fileElement.files[0]);
    console.log("解析完毕");
    // 设置音源
    audioElement.src = audioUrl;
    // 连接节点
    track.connect(audioContext.destination);
    track.connect(gain).connect(audioContext.destination);
});

// 绑定双击操作菜单元素双击后打开/关闭菜单的事件
toggleMenu.addEventListener("mousedown", dblclick(showmenu, "menu"));
// 绑定关闭菜单按钮元素点击后关闭菜单的事件
ctrlMenu.addEventListener("click", showmenu);

ctrlFullscreen.addEventListener("click", fullscreen);
toggleFullscreen.addEventListener("mousedown", dblclick(fullscreen, "fullscreen"));

//replay.addEventListener("click", restartProgress);
//toggleReplay.addEventListener("mousedown", dblclick(restartProgress, "replay"));

getStylesButton.addEventListener("click", () => {
    styleEditor.value = getStyles();
});

commitButton.addEventListener("click", () => {
    parseStyles(styleEditor.value);
});

linearGradientAddColor.addEventListener("click", addColor);

// 绑定音频播放进度条的开始与暂停事件
// progressBar.addEventListener("touchstart", stopProgress);
// progressBar.addEventListener("touchend", startProgress);
// progressBar.addEventListener("mousedown", stopProgress);
// progressBar.addEventListener("mouseup", startProgress);

// 绑定下载样式按钮点击的事件
downloadStylesButton.addEventListener("click", downloadStyles);
// 绑定刷新颜色主题按钮点击的事件
refreshStyles.addEventListener("click", getStylesStore);

// 定义相关函数功能

// 设置背景色
function setBackgroundColor() {
    // 选中该元素
    setSelection(this, backgroundColorPickers, "selected", "bgcolorpicker colorpicker");
    // 设置样式
    root.style.setProperty("--main-bgcolor", this.dataset.color);
    // 保存数值
    staticColor.dataset.color = this.dataset.color;
    // 清除冲突样式
    clearProperty("--main-bgimg");
    // main.style.backgroundColor = this.dataset.color;
}

// 设置渐变色
function setLinearGradientColor() {
    // 选中该元素
    setSelection(this, this.parentElement.childNodes, "selected", "lineargradientpicker colorpicker");
    // 保存数值
    this.parentElement.parentElement.dataset.color = this.dataset.color;
    // 设置样式
    setLinearGradient();
    // 清除冲突样式
    clearProperty("--main-bgcolor");
}

// 显示或隐藏菜单
function showmenu() {
    if (toggleMenu.dataset.menushow === "false") {
        menu.className = "container";
        toggleMenu.dataset.menushow = "true";
    }
    else if (toggleMenu.dataset.menushow === "true") {
        menu.className = "container hide";
        toggleMenu.dataset.menushow = "false";
    }
}

// 全屏模式
function fullscreen() {
    if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        if (exitFullscreen) {
            exitFullscreen.call(document);
        }
        else {
            alert("当前浏览器不支持全屏显示，请切换浏览器再打开");
        }
    }
    else {
        if (fullScreen) {
            fullScreen.call(main);
        }
        else {
            alert("当前浏览器不支持全屏显示，请切换浏览器再打开");
        }
    }
}

// 播放音频功能
function play() {
    try {
        // playButton = document.getElementById("play");
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
        if (playButton.dataset.playing === "false") {
            audioElement.play();
            playButton.dataset.playing = "true";
            playIcon.className = "fa fa-pause";
        }
        else if (playButton.dataset.playing === "true") {
            audioElement.pause();
            playButton.dataset.playing = "false";
            playIcon.className = "fa fa-play";
        }
    }
    catch (err) {
        console.error("操作执行失败,请重试");
    }
}

// 窗口状态管理
class Window {
    // 初始化
    constructor(showWindows, closeWindows, maximizeWindows) {
        this.showWindows = showWindows;
        this.closeWindows = closeWindows;
        this.maximizeWindows = maximizeWindows;
        this.alwaysFullscreen = false;
    }
    // 绑定事件监听器
    addEvent(type) {
        for (const elt of this.showWindows) {
            elt.addEventListener(type, this.showWindow);
        }
        for (const elt of this.closeWindows) {
            elt.addEventListener(type, this.closeWindow);
            elt.addEventListener(type, this.disableFullScreenMode.bind(this));
        }
        for (const elt of this.maximizeWindows) {
            elt.addEventListener(type, this.windowFullscreen.bind(this));
        }
    }
    // 打开窗口
    showWindow() {
        document.getElementById(this.dataset.window).style.display = "block";
    }
    // 关闭窗口
    closeWindow() {
        document.getElementById(this.dataset.window).style.display = "none";
    }
    // 检测窗口最大化状态并反转状态
    windowFullscreen() {
        if (!this.alwaysFullscreen) {
            this.enableFullScreenMode();
        }
        else {
            this.disableFullScreenMode();
        }
    }
    // 禁用窗口最大化
    disableFullScreenMode() {
        this.alwaysFullscreen = false;
        for (const elt of this.maximizeWindows) {
            elt.lastElementChild.className = "fa fa-window-maximize";
        }
    }
    // 启用窗口最大化
    enableFullScreenMode() {
        this.alwaysFullscreen = true;
        for (const elt of this.maximizeWindows) {
            elt.lastElementChild.className = "fa fa-window-restore";
        }
    }
}

const windowDisplay = new Window(showWindows, closeWindows, maximizeWindows);
windowDisplay.addEvent("mousedown");

// 拖动窗口
class Drag extends Window {
    // 初始化
    constructor(toolbars, container) {
        super(showWindows);
        this.toolbars = toolbars;
        this.windowContainer = container;
        this.useDragging = true;
        Drag.useDragging = true;
    }
    // 绑定事件监听器
    addEvent() {
        for (const elt of this.toolbars) {
            elt.addEventListener("touchstart", this.startDragging.bind(this, elt));
            elt.addEventListener("mousedown", this.startDragging.bind(this, elt));
            window.addEventListener("touchmove", this.dragging.bind(this));
            window.addEventListener("mousemove", this.dragging.bind(this));
        }
        for (const elt of this.showWindows) {
            elt.addEventListener("mousedown", this.focusWindow.bind(this, elt));
        }
        window.addEventListener("mouseup", this.finishDragging.bind(this));
        window.addEventListener("touchend", this.finishDragging.bind(this));
    }
    // 开始拖动
    startDragging(elt,e) {
        this.draggingWindow = document.getElementById(elt.dataset.window);
        this.isDragging = true;
        this.focusWindow.call(this, null);
        // 检测事件类型以获取相应X,Y坐标
        if (e.type == "touchstart") {
            // 计算鼠标坐标与窗口坐标的差值
            this.draggingWindow.dataset.deltaLeft = e.touches[0].pageX - this.draggingWindow.style.left.split("px")[0];
            this.draggingWindow.dataset.deltaTop = e.touches[0].pageY - this.draggingWindow.style.top.split("px")[0];
        }
        else if (e.type == "mousedown") {
            // 计算鼠标坐标与窗口坐标的差值
            this.draggingWindow.dataset.deltaLeft = e.pageX - this.draggingWindow.style.left.split("px")[0];
            this.draggingWindow.dataset.deltaTop = e.pageY - this.draggingWindow.style.top.split("px")[0];
        }
        // if (useDragging) {
        //     for (const elt of toolbars) {
        //         elt.style.cursor = "grabbing";
        //     }
        //     root.style.cursor = "grabbing";
        // }
    }
    // 正在拖动
    dragging(e) {
        // 检测是否正在拖动或已启用拖动功能
        if (this.isDragging === true && this.useDragging === true && Drag.useDragging == true) {
            // 检测事件类型以设置相应X,Y坐标
            if (e.type == "touchmove") {
                // 设置X,Y坐标
                this.draggingWindow.style.left = `${e.touches[0].pageX - this.draggingWindow.dataset.deltaLeft}px`;
                this.draggingWindow.style.top = `${e.touches[0].pageY - this.draggingWindow.dataset.deltaTop}px`;
            }
            else if (e.type == "mousemove") {
                // 设置X,Y坐标
                this.draggingWindow.style.left = `${e.pageX - this.draggingWindow.dataset.deltaLeft}px`;
                this.draggingWindow.style.top = `${e.pageY - this.draggingWindow.dataset.deltaTop}px`;
            }
        }
    }
    // 结束拖动
    finishDragging() {
        // for (const elt of toolbars) {
        //     elt.style.cursor = "grab";
        // }
        this.isDragging = false;
        // root.style.cursor = "default";
    }
    // 将焦点聚集在正在拖动的窗口
    focusWindow(elt) {
        // 检测是否存在正在拖动的窗口
        if (elt != null) {
            this.draggingWindow = document.getElementById(elt.dataset.window);
        }
        // 延迟执行
        window.setTimeout(() => {
            // 获取最后一个子元素
            const lastChild = this.windowContainer.lastElementChild;
            // 检测并进行替换
            if (lastChild != this.draggingWindow) {
                this.windowContainer.removeChild(this.draggingWindow);
                this.windowContainer.appendChild(this.draggingWindow);
            }
        }, 2);
    }
}

// 实例化
const drag = new Drag(toolbars, windowContainer);
drag.addEvent();

// 音频播放进度条
class Progress {
    constructor(progress, container, audio, playButton) {
        this.container = container;
        this.progress = progress;
        this.audio = audio;
        this.playButton = playButton;
        this.progressing = null;
    }
    addEvent() {
        this.progress.addEventListener("touchstart", this.stopProgress.bind(this));
        this.progress.addEventListener("touchend", this.startProgress.bind(this));
        this.progress.addEventListener("mousedown", this.stopProgress.bind(this));
        this.progress.addEventListener("mouseup", this.startProgress.bind(this));
    }
    addProgress() {
        this.container.className = "show";
        this.progressing = window.setInterval(this.syncProgress, 20);
    }
    stopProgress() {
        window.clearInterval(this.progressing);
        this.audio.pause();
    }
    startProgress() {
        this.audio.currentTime = this.progress.value / 10000;
        if (this.playButton.dataset.playing === "true") {
            this.audio.play();
        }
        this.progressing = window.setInterval(this.syncProgress, 20);
    }
    syncProgress() {
        this.progress.value = this.audio.currentTime * 10000;
        this.progress.max = this.audio.duration * 10000;
    }
    deleteProgress() {
        clearInterval(this.progressing);
        this.progress.value = 0;
        this.container.className = "hide";
    }
    restartProgress() {
        this.progress.value = 0;
        this.audio.currentTime = 0;
    }
}

const progress = new Progress(progressBar, progressContainer, audioElement, playButton);
progress.addEvent();
fileElement.addEventListener("change", progress.addProgress.bind(progress));

// 获取样式
function getStyles() {
    var styles = window.getComputedStyle(root, null);
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

// 解析样式
function parseStyles(style) {
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
    root.setAttribute("style", commitStyles);
}

// 判断颜色深浅
function colorDepth(hex) {
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

// 下载样式
function downloadStyles() {
    var style = getStyles();
    download(style, "text/plain", "styles.txt");
}

// 下载功能
function download(text, type, file_name) {
    var blob = new Blob([text], { "type": type });
    var element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.style.display = "none";
    element.download = file_name;
    main.appendChild(element);
    element.click();
    main.removeChild(element);
}

// 双击事件判断处理方法
function dblclick(fn, key) {
    return function () {
        if (prevClick[key] == 0) {
            prevClick[key] = 1;
            window.setTimeout(() => {
                prevClick[key] = 0;
            }, 300);
        }
        else {
            prevClick[key] = 0;
            fn();
        }
    }
}

// 颜色选择器选择颜色
function selectorColor() {
    this.parentElement.dataset.color = this.value;
    this.parentElement.style.backgroundColor = this.value;
    if (colorDepth(this.value)) {
        this.parentElement.style.color = "#dddddd";
    }
    else {
        this.parentElement.style.color = "#222222";
    }
    root.style.setProperty("--main-bgcolor", backgroundColorSelector.value);
    staticColor.dataset.color = backgroundColorSelector.value;
}
function linearGradientSelectorColor() {
    if (this.value) {
        this.parentElement.dataset.color = this.value;
        this.parentElement.parentElement.parentElement.dataset.color = this.value;
        this.parentElement.style.backgroundColor = this.value;
        if (colorDepth(this.value)) {
            this.parentElement.style.color = "#dddddd";
        }
        else {
            this.parentElement.style.color = "#222222";
        }
        setLinearGradient.call(this);
        setLinearGradientColor.call(this.parentElement);
    }
    else {
        setLinearGradientColor.call(this);
    }
}

// 选择背景类型
function chooseBackground() {
    document.getElementById(this.dataset.open).className = "selector";
    document.getElementById(this.dataset.close).className = "selector disabled";
    if (this.dataset.open === "static-color") {
        setProperty("--main-bgcolor", staticColor.dataset.color);
        clearProperty("--main-bgimg");
    }
    else if (this.dataset.open === "linear-gradient") {
        setProperty("--main-bgcolor", "white");
        setLinearGradient();
    }
}

// 清除或设置某个根元素的样式属性
function clearProperty(property_name) {
    root.style.setProperty(property_name, "none");
}
function setProperty(property_name, value) {
    root.style.setProperty(property_name, value);
}


function selectLinearGradientDirection() {
    const selected = this;
    setSelection(selected, linearGradientOptions, "option-selected", "option linear-gradient-option");
    linearGradientFrom.innerText = selected.dataset.from;
    linearGradientTo.innerText = selected.dataset.to;
    LinearGradientDirection = this.dataset.value;
    setLinearGradient();
}

// 设置选择
function setSelection(selected, elements, selected_className, unselected_className) {
    for (const elt of elements) {
        elt.className = unselected_className;
    }
    selected.className += ` ${selected_className}`;
}

// 添加渐变色
function addColor() {
    const element = generateElement("div", "", "selector", "white", "color");
    const selector_element = generateElement("div", "", "inline");
    const delete_icon = generateElement("i", "", "fa fa-trash");
    const delete_element = generateElement("div", "", "button");
    delete_element.appendChild(delete_icon);
    delete_element.innerHTML += " 删除颜色";
    element.appendChild(delete_element);
    delete_element.addEventListener("click", function () {
        linearGradientColors.removeChild(this.parentElement);
        setLinearGradient();
    })
    for (const value of colorList) {
        var colorpicker;
        if (value != "white") {
            colorpicker = generateElement("div", "", "colorpicker lineargradientpicker", value, "color");
        }
        else if (value == "white") {
            colorpicker = generateElement("div", "", "colorpicker lineargradientpicker selected", value, "color");
        }
        selector_element.appendChild(colorpicker);
        colorpicker.onclick = setLinearGradientColor;
    }
    const colorselector = generateElement("label", "", "lineargradientpicker colorpicker colorselector", "black", "color");
    const color = document.createElement("input");
    const ellipsis = generateElement("i", "", "fa fa-ellipsis-h ellipsis")
    color.type = "color";
    colorselector.appendChild(ellipsis);
    colorselector.appendChild(color);
    selector_element.appendChild(colorselector);
    element.appendChild(selector_element);
    linearGradientColors.appendChild(element);
    color.addEventListener("change", linearGradientSelectorColor);
    color.addEventListener("change", linearGradientSelectorColor);
    colorselector.addEventListener("click", linearGradientSelectorColor);
    setPickerColor();
    setLinearGradient();
}

function setLinearGradient() {
    const colors = linearGradientColors.childNodes;
    var result = "";
    for (const value of colors) {
        result += `${value.dataset.color}, `;
    }
    result = `linear-gradient(to ${LinearGradientDirection}, ${result})`.replace(", )", ")");
    root.style.setProperty("--main-bgimg", result);
}

// 生成元素
function generateElement(type, inner, className, data = null, dataset = null, textType = "innerText") {
    const element = document.createElement(type);
    element[textType] = inner;
    element.className = className;
    if (data && dataset) {
        element.dataset[dataset] = data;
    }
    return element;
}

// 获取网页文本
async function fetchText(url) {
    const response = await fetch(url);
    const text = await response.text();
    return text;
}

// 获取网页JSON数据
async function fetchJSON(url) {
    const response = await fetch(url);
    const json = await response.json();
    return json;
}

// 获取网页文件并将其本地化
async function fetchFile(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    const result = URL.createObjectURL(blob);
    return result;
}

// 获取文件列表中的每个文件
async function startGenerate(filelist) {
    for (const file of filelist) {
        if (file != "") {
            generate(file);
        }
    }
}

// 获取样式元数据
async function generate(file) {
    const meta = await fetchJSON(`${domain}/${stylesRepoName}/${file}/meta.json`);
    generateStyleBox(file, meta);
}

// 获取样式库
async function getStylesStore() {
    if ((!domain) || (!stylesRepoName)) {
        console.error("Load failed")
        return false;
    }
    colorTheme.innerHTML = "";
    refreshStyles.className = "button disabled";
    var filelist = await fetchText(`${domain}/${stylesRepoName}/list.txt`);
    filelist = filelist.split("\n");
    await startGenerate(filelist);
}

// 生成样式介绍栏
async function generateStyleBox(file, meta) {
    const element_image = document.createElement("div");
    // 父元素
    const element = generateElement("div", "", "style-box");
    // 异步获取图像
    generateStyleImage(file, meta, element_image, element);
    // 获取样式, 创建元素
    const style = await fetchText(`${domain}/${stylesRepoName}/${file}/${meta.styles}`);
    element.dataset.style = style;
    const element_details = generateElement("div", meta.description, "style-details");
    const element_title = generateElement("div", meta.name, "style-title");
    const element_authors = generateElement("div", `作者: ${meta.authors}`, "subtitle");
    const element_description = generateElement("div", "", "style-description");
    element_title.appendChild(element_authors);
    element_description.appendChild(element_title);
    element_description.appendChild(element_details);
    element.appendChild(element_description);
    colorTheme.appendChild(element);
    // 点击后设置样式
    element.addEventListener("click", function () {
        root.setAttribute("style", this.dataset.style);
    });
}

// 获取样式介绍图片
async function generateStyleImage(file, meta, element_image, box) {
    // 获取图像
    const image = await fetchFile(`${domain}/${stylesRepoName}/${file}/${meta.image}`);
    element_image.className = "style-image";
    element_image.style.backgroundImage = `url(${image})`;
    box.insertBefore(element_image, box.firstElementChild);
    window.setTimeout(() => { refreshStyles.className = "button"; }, 300);
}

// 为颜色选择器添加颜色
function setPickerColor() {
    for (const elt of colorPickers) {
        elt.style.backgroundColor = elt.dataset.color;
    }
}

// 设置定时循环程序
window.setInterval(() => {
    if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        fullscreenIcon.className = "fa fa-compress";
    }
    else {
        fullscreenIcon.className = "fa fa-expand";
    }
    if (window.innerWidth < 400 || windowDisplay.alwaysFullscreen || window.innerHeight < 500) {
        drag.useDragging = false;
        for (const elt of windows) {
            elt.className = "window fullscreen";
        }
    }
    else if (!windowDisplay.alwaysFullscreen) {
        drag.useDragging = true;
        for (const elt of windows) {
            elt.className = "window";
        }
    }
}, 20);