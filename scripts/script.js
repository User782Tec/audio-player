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
const backgroundColorSelecter = document.getElementById("bgcolorselect");
// 背景颜色自定义选择器关联元素
const backgroundColorSelecterLabel = document.getElementById("bgcolorselectlabel");

// 背景类型选择器元素
const staticColor = document.getElementById("static-color");
const linearGradient = document.getElementById("linear-gradient");

// 渐变色相关参数选择元素
const linearGradientTo = document.getElementById("gradient-to");
const linearGradientFrom = document.getElementById("gradient-from");
const linearGradientOptions = document.getElementsByClassName("linear-gradient-option");
const linearGradientColors = document.getElementById("linear-gradient-colors");
// 为渐变色添加颜色的按钮元素
const linearGradientAddColor = document.getElementById("addcolor");

// 是否启用窗口拖拽
var useDragging = true;
// 记录当前正在拖动的窗口
var draggingWindow;

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
    elt.addEventListener("click", function () {
        // 选中该元素
        setSelection(this, backgroundColorPickers, "selected", "bgcolorpicker");
        // 设置样式
        root.style.setProperty("--main-bgcolor", this.dataset.color);
        // 保存数值
        staticColor.dataset.color = this.dataset.color;
        // 清除冲突样式
        clearProperty("--main-bgimg");
        // main.style.backgroundColor = this.dataset.color;
    });
}

setPickerColor();

// 绑定显示窗口按钮点击事件
for (const elt of showWindows) {
    elt.addEventListener("click", showWindow);
}

// 绑定关闭窗口按钮点击事件
for (const elt of closeWindows) {
    elt.addEventListener("click", closeWindow);
}

// 将正在被拖动的窗口置于最上面显示
for (const elt of windows) {
    elt.addEventListener("touchstart", showFirst);
    elt.addEventListener("mousedown", showFirst);
}

// 绑定最大化窗口按钮点击事件
for (const elt of maximizeWindows) {
    elt.addEventListener("click", windowFullscreen);
}

// 拖拽窗口事件绑定
for (const elt of toolbars) {
    elt.addEventListener("touchstart", startDragging);
    window.addEventListener("touchmove", dragging);
    elt.addEventListener("mousedown", startDragging);
    window.addEventListener("mousemove", dragging);
}

// 绑定背景类型选择元素选择事件
for (const elt of backgroundType) {
    elt.addEventListener("mousedown", chooseBackground);
}

// 绑定线性渐变色方向下拉列表选项选择事件
for (const elt of linearGradientOptions) {
    elt.addEventListener("mousedown",selectLinearGradientDirection);
}

// 绑定自定义背景色选择器数值变动时的设置颜色时间
backgroundColorSelecter.addEventListener("change", selectorColor(function () {
    root.style.setProperty("--main-bgcolor", backgroundColorSelecter.value);
    staticColor.dataset.color = backgroundColorSelecter.value;
}));

// 绑定结束拖动窗口时事件
window.addEventListener("touchend", finishDragging);
window.addEventListener("mouseup", finishDragging);

// 绑定播放按钮元素点击后播放音频的事件
playButton.addEventListener("click", play);
// 绑定双击操作播放元素双击后播放音频的事件
togglePlay.addEventListener("mousedown", dblclick(play, "play"));

// 绑定音频播放结束后的事件
audioElement.addEventListener("ended", () => {
    playButton.dataset.playing = "false";
    playIcon.className = "fa fa-play";
    // 重置进度条
    restartProgress()
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
    // fileElement = document.getElemedcntById("files");
    // audioElement = document.getElementById("audio");
    console.log("开始解析");
    // 解析为Blob
    var audioUrl = URL.createObjectURL(fileElement.files[0]);
    console.log("解析完毕");
    // 设置音源
    audioElement.src = audioUrl;
    // 连接节点
    track.connect(audioContext.destination);
    track.connect(gain).connect(audioContext.destination);
    // 添加进度条
    addProgress();
});

// 绑定双击操作菜单元素双击后打开/关闭菜单的事件
toggleMenu.addEventListener("mousedown", dblclick(showmenu, "menu"));
// 绑定关闭菜单按钮元素点击后关闭菜单的事件
ctrlMenu.addEventListener("click", showmenu);

ctrlFullscreen.addEventListener("click", fullscreen);
toggleFullscreen.addEventListener("mousedown", dblclick(fullscreen, "fullscreen"));

replay.addEventListener("click", restartProgress);
toggleReplay.addEventListener("mousedown", dblclick(restartProgress, "replay"));

getStylesButton.addEventListener("click", () => {
    styleEditor.value = getStyles();
});

commitButton.addEventListener("click", () => {
    parseStyles(styleEditor.value);
});

// 绑定音频播放进度条的开始与暂停事件
progressBar.addEventListener("touchstart", stopProgress);
progressBar.addEventListener("touchend", startProgress);
progressBar.addEventListener("mousedown", stopProgress);
progressBar.addEventListener("mouseup", startProgress);

// 绑定下载样式按钮点击的事件
downloadStylesButton.addEventListener("click", downloadStyles);
// 绑定刷新颜色主题按钮点击的事件
refreshStyles.addEventListener("click", getStylesStore);

// 定义相关函数功能

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

// 将正在拖动的窗口置于最上面显示
function showFirst() {
    var thisWindow = this;
    window.setTimeout(() => {
        // var node = aboutWindow.cloneNode(true);
        var lastChild = windowContainer.lastElementChild;
        if (lastChild != thisWindow) {
            windowContainer.removeChild(thisWindow);
            windowContainer.appendChild(thisWindow);
        }
    }, 2);
}

// 窗口的最大化方法
function windowFullscreen() {
    if (!alwaysFullscreen) {
        enableFullScreenMode();
    }
    else {
        disableFullScreenMode();
    }
}

// 打开/关闭窗口
function showWindow() {
    document.getElementById(this.dataset.window).style.display = "block";
    showFirst.call(document.getElementById(this.dataset.window));
}

function closeWindow() {
    document.getElementById(this.dataset.window).style.display = "none";
    disableFullScreenMode();
}

// 拖动相关功能
function startDragging(e) {
    draggingWindow = document.getElementById(this.dataset.window);
    root.dataset.dragging = "true";
    if (e.type == "touchstart") {
        draggingWindow.dataset.left = e.touches[0].pageX - document.getElementById(this.dataset.window).style.left.split("px")[0];
        draggingWindow.dataset.top = e.touches[0].pageY - document.getElementById(this.dataset.window).style.top.split("px")[0];
    }
    else if (e.type == "mousedown") {
        draggingWindow.dataset.left = e.pageX - document.getElementById(this.dataset.window).style.left.split("px")[0];
        draggingWindow.dataset.top = e.pageY - document.getElementById(this.dataset.window).style.top.split("px")[0];
    }
    // if (useDragging) {
    //     for (const elt of toolbars) {
    //         elt.style.cursor = "grabbing";
    //     }
    //     root.style.cursor = "grabbing";
    // }
}
function dragging(e) {
    if (root.dataset.dragging === "true" && useDragging) {
        if (e.type == "touchmove") {
            draggingWindow.style.left = `${e.touches[0].pageX - draggingWindow.dataset.left}px`;
            draggingWindow.style.top = `${e.touches[0].pageY - draggingWindow.dataset.top}px`;
        }
        else if (e.type == "mousemove") {
            draggingWindow.style.left = `${e.pageX - draggingWindow.dataset.left}px`;
            draggingWindow.style.top = `${e.pageY - draggingWindow.dataset.top}px`;
        }
    }
}
function finishDragging() {
    // for (const elt of toolbars) {
    //     elt.style.cursor = "grab";
    // }
    root.dataset.dragging = "false";
    // root.style.cursor = "default";
}

// 音频进度条相关功能
function addProgress() {
    progressContainer.className = "show";
    progressing = window.setInterval(syncProgress, 20);
}
function stopProgress() {
    window.clearInterval(progressing);
    audioElement.pause();
    progressBar.disabled = false;
}
function startProgress() {
    audioElement.currentTime = progressBar.value / 10000;
    if (playButton.dataset.playing === "true") {
        audioElement.play();
    }
    progressing = window.setInterval(syncProgress, 20);
    progressBar.disabled = "disabled";
}
function syncProgress() {
    progressBar.value = audioElement.currentTime * 10000;
    progressBar.max = audioElement.duration * 10000;
}
function deleteProgress() {
    clearInterval(progressing);
    progressContainer.className = "hide";
}
function restartProgress() {
    progressBar.value = 0;
    audioElement.currentTime = 0;
}

// 获取样式
function getStyles() {
    var styles = window.getComputedStyle(root, null);
    var result = "{\n";
    for (const i of styles) {
        if (i.match("--")) {
            result += `    "${i.replace("--","")}": "${styles.getPropertyValue(i)}",\n`;
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
function selectorColor(fn) {
    return function() {
        this.parentElement.dataset.color = this.value;
        this.parentElement.style.backgroundColor = this.value;
        if (colorDepth(this.value)) {
            this.parentElement.style.color = "#dddddd";
        }
        else {
            this.parentElement.style.color = "#222222";
        }
        fn();
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
    setSelection(selected,linearGradientOptions,"option-selected","option linear-gradient-option");
    linearGradientFrom.innerText = selected.dataset.from;
    linearGradientTo.innerText = selected.dataset.to;
}

// 设置选择
function setSelection(selected,elements,selected_className,unselected_className) {
    for (const elt of elements) {
        elt.className = unselected_className;
    }
    selected.className += ` ${selected_className}`;
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
    // 创建元素
    const element_image = document.createElement("div");
    const element_details = document.createElement("div");
    const element_title = document.createElement("div");
    const element_description = document.createElement("div");
    const element_authors = document.createElement("div");
    // 父元素
    const element = document.createElement("div");
    // 异步获取图像
    generateStyleImage(file, meta, element_image, element);
    // 获取样式
    const style = await fetchText(`${domain}/${stylesRepoName}/${file}/${meta.styles}`);
    element.className = "style-box";
    element.dataset.style = style;
    element_details.className = "style-details";
    element_details.innerText = meta.description;
    element_title.className = "style-title";
    element_title.innerText = meta.name;
    element_authors.className = "subtitle";
    element_authors.innerText = `作者: ${meta.authors}`;
    element_description.className = "style-description";
    element_title.appendChild(element_authors);
    element_description.appendChild(element_title);
    element_description.appendChild(element_details);
    element.appendChild(element_description);
    colorTheme.appendChild(element);
    // 点击后设置样式
    element.addEventListener("click",function(){
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

// 禁用或启用窗口最大化
function disableFullScreenMode() {
    alwaysFullscreen = false;
    for (const elt of maximizeWindows) {
        elt.lastElementChild.className = "fa fa-window-maximize";
    }
}
function enableFullScreenMode() {
    alwaysFullscreen = true;
    for (const elt of maximizeWindows) {
        elt.lastElementChild.className = "fa fa-window-restore";
    }
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
    if (window.innerWidth < 400 || alwaysFullscreen || window.innerHeight < 500) {
        useDragging = false;
        for (const elt of windows) {
            elt.className = "window fullscreen";
        }
    }
    else if (!alwaysFullscreen) {
        useDragging = true;
        for (const elt of windows) {
            elt.className = "window";
        }
    }
}, 20);