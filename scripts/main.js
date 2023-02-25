'use strict';

import Base from './base.js';
import Styles from './styles.js';

const main = document.getElementById("main");

const exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen;
const fullScreen = main.requestFullscreen || main.mozRequestFullScreen || main.webkitRequestFullscreen;

const playButton = document.getElementById("play");
const togglePlay = document.getElementById("toggleplay");

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

// 音频源节点
//const track = audioContext.createMediaElementSource(audioElement);

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
    const config = await Base.Fetch.fetchJSON('configs/config.json');
    const styleConfigData = await Base.Fetch.fetchJSON('configs/style_configs.json');
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
backgroundColorSelector.addEventListener("input", selectorColor);
// 绑定播放按钮元素点击后播放音频的事件
playButton.addEventListener("click", play);

// 绑定音频播放结束后的事件
audioElement.addEventListener("ended", () => {
    playButton.dataset.playing = "false";
    playButton.lastElementChild.className = "fa fa-play";
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
    playButton.lastElementChild.className = "fa fa-play"
    console.log("开始解析");
    // 解析为Blob
    var audioUrl = URL.createObjectURL(fileElement.files[0]);
    console.log("解析完毕");
    // 设置音源
    audioElement.src = audioUrl;
    // 连接节点
    // track.connect(audioContext.destination);
    // track.connect(gain).connect(audioContext.destination);
});

// 绑定双击操作菜单元素双击后打开/关闭菜单的事件
toggleMenu.addEventListener("mousedown", Base.dblclick(showmenu));
// 绑定关闭菜单按钮元素点击后关闭菜单的事件
ctrlMenu.addEventListener("click", showmenu);

ctrlFullscreen.addEventListener("click", fullscreen);
toggleFullscreen.addEventListener("mousedown", Base.dblclick(fullscreen));

getStylesButton.addEventListener("click", () => {
    styleEditor.value = Styles.getStyles(stylesConfig);
});

commitButton.addEventListener("click", () => {
    Styles.pushStyles(Styles.parseStyles(styleEditor.value, stylesConfig));
});

linearGradientAddColor.addEventListener("click", addColor);

// 绑定下载样式按钮点击的事件
downloadStylesButton.addEventListener("click", () => {
    Styles.downloadStyles(stylesConfig);
});
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
    Styles.setProperty("--main-bgimg", "none");
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
    Styles.setProperty("--main-bgcolor", "none");
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

class AudioController {
    constructor(audioElement, playButton) {
        this.audioElement = audioElement;
        this.playButton = playButton;
    }
    register() {
        this.audioElement.addEventListener("pause", () => {
            this.playButton.lastElementChild.className = "fa fa-play";
        });
        this.audioElement.addEventListener("play", () => {
            this.playButton.lastElementChild.className = "fa fa-pause";
        });
        this.playButton.addEventListener("click", () => {
            this.play();
        });
    }
    play() {
        if (this.audioElement.paused === true) {
            this.audioElement.play();
        }
        else if (this.audioElement.paused === false) {
            this.audioElement.pause();
        }
    }
}
const audio = new AudioController(audioElement, playButton);
audio.register();
togglePlay.addEventListener("mousedown", Base.dblclick(audio.play.bind(audio)));

// 窗口状态管理
class Window {
    // 初始化
    constructor(showWindows, closeWindows, maximizeWindows, windows) {
        this.showWindows = showWindows;
        this.closeWindows = closeWindows;
        this.maximizeWindows = maximizeWindows;
        this.windows = windows;
        this.alwaysFullscreen = false;
        this.windowCount = 0;
        for (const elt of this.windows) {
            this.windowCount++;
        }
    }
    // 绑定事件监听器
    register() {
        for (const elt of this.showWindows) {
            elt.addEventListener("click", this.showWindow.bind(this, elt));
        }
        for (const elt of this.closeWindows) {
            elt.addEventListener("click", this.closeWindow);
            elt.addEventListener("click", this.disableFullScreenMode.bind(this));
        }
        for (const elt of this.maximizeWindows) {
            elt.addEventListener("click", this.windowFullscreen.bind(this));
        }
        for (const elt of this.windows) {
            elt.addEventListener("mousedown", this.focusWindow.bind(this, elt));
            elt.addEventListener("touchstart", this.focusWindow.bind(this, elt));
        }
    }
    // 打开窗口
    showWindow(elt) {
        document.getElementById(elt.dataset.window).style.display = "block";
        window.setTimeout(() => {
            this.focusWindow(document.getElementById(elt.dataset.window));
        }, 2);
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
    focusWindow(elt) {
        for (const element of this.windows) {
            if (element.style.zIndex >= elt.style.zIndex) {
                element.style.zIndex--;
            }
        }
        elt.style.zIndex = this.windowCount;
    }
}

const windowDisplay = new Window(showWindows, closeWindows, maximizeWindows, windows);
windowDisplay.register();

// 拖动窗口
class Drag {
    // 初始化
    constructor(toolbars, container, showWindows) {
        this.toolbars = toolbars;
        this.windowContainer = container;
        this.showWindows = showWindows;
        this.useDragging = true;
        Drag.useDragging = true;
    }
    // 绑定事件监听器
    register() {
        for (const elt of this.toolbars) {
            elt.addEventListener("touchstart", this.startDragging.bind(this, elt));
            elt.addEventListener("mousedown", this.startDragging.bind(this, elt));
            window.addEventListener("touchmove", this.dragging.bind(this));
            window.addEventListener("mousemove", this.dragging.bind(this));
        }
        window.addEventListener("mouseup", this.finishDragging.bind(this));
        window.addEventListener("touchend", this.finishDragging.bind(this));
    }
    // 开始拖动
    startDragging(elt,e) {
        this.draggingWindow = document.getElementById(elt.dataset.window);
        this.isDragging = true;
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
}

const drag = new Drag(toolbars, windowContainer, showWindows);
drag.register();

// 音频播放进度条
class Progress extends AudioController {
    constructor(progress, container, audio, playButton) {
        super(audio);
        this.container = container;
        this.progress = progress;
        this.playButton = playButton;
        this.progressing = null;
        this.audioPaused = true;
    }
    register() {
        this.progress.addEventListener("touchstart", this.stopProgress.bind(this));
        this.progress.addEventListener("touchend", this.startProgress.bind(this));
        this.progress.addEventListener("mousedown", this.stopProgress.bind(this));
        this.progress.addEventListener("mouseup", this.startProgress.bind(this));
    }
    addProgress() {
        this.container.className = "show";
        this.progressing = window.setInterval(this.syncProgress.bind(this), 20);
    }
    stopProgress() {
        this.audioPaused = this.audioElement.paused;
        window.clearInterval(this.progressing);
        this.audioElement.pause();
    }
    startProgress() {
        this.audioElement.currentTime = this.progress.value / 10000;
        if (this.audioPaused === false) {
            this.audioElement.play();
        }
        console.log(this)
        this.progressing = window.setInterval(this.syncProgress.bind(this), 20);
    }
    syncProgress() {
        this.progress.value = this.audioElement.currentTime * 10000;
        this.progress.max = this.audioElement.duration * 10000;
    }
    deleteProgress() {
        clearInterval(this.progressing);
        this.progress.value = 0;
        this.container.className = "hide";
    }
    restartProgress() {
        this.progress.value = 0;
        this.audioElement.currentTime = 0;
    }
}

const progress = new Progress(progressBar, progressContainer, audioElement, playButton);
progress.register();
fileElement.addEventListener("change", progress.addProgress.bind(progress));

// 回放
replay.addEventListener("click", () => {
    progress.restartProgress.bind(progress);
    audio.play.bind(audio);
});
toggleReplay.addEventListener("mousedown", Base.dblclick(() => {
    progress.restartProgress.bind(progress);
    audio.play.bind(audio);
}));


// 颜色选择器选择颜色
function selectorColor() {
    this.parentElement.dataset.color = this.value;
    this.parentElement.style.backgroundColor = this.value;
    if (Styles.colorDepth(this.value)) {
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
        if (Styles.colorDepth(this.value)) {
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
        Styles.setProperty("--main-bgcolor", staticColor.dataset.color);
        Styles.setProperty("--main-bgimg", "none");
    }
    else if (this.dataset.open === "linear-gradient") {
        Styles.setProperty("--main-bgcolor", "white");
        setLinearGradient();
    }
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
    const meta = await Base.Fetch.fetchJSON(`${domain}/${stylesRepoName}/${file}/meta.json`);
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
    var filelist = await Base.Fetch.fetchText(`${domain}/${stylesRepoName}/list.txt`);
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
    const style = await Base.Fetch.fetchText(`${domain}/${stylesRepoName}/${file}/${meta.styles}`);
    element.dataset.style = Styles.parseStyles(style, stylesConfig);
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
    const image = await Base.Fetch.fetchFile(`${domain}/${stylesRepoName}/${file}/${meta.image}`);
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