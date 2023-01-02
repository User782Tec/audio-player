'use strict';

//变量声明与赋值

//AudioContext
const AudioContext = window.AudioContext || window.webkitAudioContext; //适配较老的浏览器
const audioContext = new AudioContext();

//主元素(非根元素)
const main = document.getElementById("main");

//全屏模式方法
const exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen;
const fullScreen = main.requestFullscreen || main.mozRequestFullScreen || main.webkitRequestFullscreen;

//播放相关元素
const playButton = document.getElementById("play");
const togglePlay = document.getElementById("toggleplay");
const playIcon = document.getElementById("play-icon");

//音频文件上传相关元素
const fileElement = document.getElementById("files");
const audioFileButton = document.getElementById("audio-file-btn");

//音频源元素
const audioElement = document.getElementById("audio");

//显示或隐藏菜单的相关元素
const ctrlMenu = document.getElementById("showmenu");
const toggleMenu = document.getElementById("togglemenu");

//进入或退出全屏模式的相关元素
const ctrlFullscreen = document.getElementById("fullscreen");
const fullscreenIcon = document.getElementById("fullscreen-icon");
const toggleFullscreen = document.getElementById("togglefullscreen");

//重新播放音频的相关元素
const replay = document.getElementById("replay");
const toggleReplay = document.getElementById("togglereplay");

//各个窗口、标题栏和按钮
const windows = document.getElementsByClassName("window");
const showWindows = document.getElementsByClassName("showwindow");
const closeWindows = document.getElementsByClassName("close");
const toolbars = document.getElementsByClassName("toolbar");
const maximizeWindows = document.getElementsByClassName("maximum");

//菜单元素
const menu = document.getElementById("menu");

//FileReader
const reader = new FileReader();      

//Date
const date = new Date();

//音量增益节点
const gain = audioContext.createGain();

//音频源节点
const track = audioContext.createMediaElementSource(audioElement);

//记录第一次点击，用于双击判断
const prevClick = { play: 0, fullscreen: 0, menu: 0, replay: 0 };

//根元素(非主元素)
const root = document.querySelector(":root");

//颜色选择器元素
const colorPickers = document.getElementsByClassName("colorpicker");

//背景颜色选择器元素
const backgroundColorPickers = document.getElementsByClassName("bgcolorpicker");
//背景颜色自定义选择器元素
const backgroundColorSelecter = document.getElementById("bgcolorselect");
//背景颜色自定义选择器关联元素
const backgroundColorSelecterLabel = document.getElementById("bgcolorselectlabel");

//背景类型选择器元素
const staticColor = document.getElementById("static-color");
const linearGradient = document.getElementById("linear-gradient");

//渐变色相关参数选择元素
const linearGradientTo = document.getElementById("gradient-to");
const linearGradientFrom = document.getElementById("gradient-from");
const linearGradientOptions = document.getElementsByClassName("linear-gradient-option");

//是否启用窗口拖拽
var useDragging = true;

//是否启用强制窗口最大化
var alwaysFullscreen = false;

//获取样式配置按钮元素
const getStylesButton = document.getElementById("getstyles");
//高级样式编辑元素
const styleEditor = document.getElementById("style-editor");
//提交更改样式
const commitButton = document.getElementById("commit");
//下载当前样式配置
const downloadStylesButton = document.getElementById("downloadstyles");

//窗口容器
const windowContainer = document.getElementById("windows");

//音频播放进度条容器
const progressContainer = document.getElementById("progress-container");
//音频播放进度条
const progressBar = document.getElementById("progress");
//用于存储更新音频播放进度条定时事件的变量
var progressing;

//选择背景类型的元素
const backgroundType = document.getElementsByClassName("background-type");

//颜色主题容器
const colorTheme = document.getElementById("color-theme");

//刷新颜色主题的元素
const refreshStyles = document.getElementById("refresh-styles");

//默认域
var domain;
//默认颜色主题仓库(目录)名称
var stylesRepoName;
(async function () {
    const response = await fetchText('config.json');
    const config = JSON.parse(response);
    //配置默认域
    domain = config.domain;
    //配置颜色主题仓库(目录)名称
    stylesRepoName = config.style_repo_name;
    getStylesStore();
})();

//绑定事件监听器
for (const elt of backgroundColorPickers) {
    elt.addEventListener("click", function () {
        for (const elt of backgroundColorPickers) {
            elt.className = "bgcolorpicker";
        }
        this.dataset.selected = 'true';
        this.className = "bgcolorpicker selected";
        root.style.setProperty("--main-bgcolor", this.dataset.color);
        staticColor.dataset.color = this.dataset.color;
        clearProperty("--main-bgimg");
        //main.style.backgroundColor = this.dataset.color;
    });
}

//为颜色选择器添加颜色
for (const elt of colorPickers) {
    elt.style.backgroundColor = elt.dataset.color;
}

for (const elt of showWindows) {
    elt.addEventListener("click", showWindow);
}

for (const elt of closeWindows) {
    elt.addEventListener("click", closeWindow);
}

for (const elt of windows) {
    elt.addEventListener("touchstart", showFirst);
    elt.addEventListener("mousedown", showFirst);
}

for (const elt of maximizeWindows) {
    elt.addEventListener("click", windowFullscreen);
}

for (const elt of toolbars) {
    elt.addEventListener("touchstart", startTouchDragging);
    elt.addEventListener("touchmove", touchDragging);
    elt.addEventListener("mousedown", startMouseDragging);
    elt.addEventListener("mousemove", mouseDragging);
}

for (const elt of backgroundType) {
    elt.addEventListener("mousedown", chooseBackground);
}

for (const elt of linearGradientOptions) {
    elt.addEventListener("mousedown",selectLinearGradientDirection);
}

backgroundColorSelecter.addEventListener("change", selectorColor(function () {
    root.style.setProperty("--main-bgcolor", backgroundColorSelecter.value);
    staticColor.dataset.color = backgroundColorSelecter.value;
}));

window.addEventListener("touchend", finishDragging);
window.addEventListener("mouseup", finishDragging);

playButton.addEventListener("click", play);
togglePlay.addEventListener("mousedown", dblclick(play, "play"));

audioElement.addEventListener("ended", () => {
    playButton.dataset.playing = "false";
    playIcon.className = "fa fa-play";
    restartProgress()
});

/*reader.addEventListener("loadend", () => {
    console.log("解析完毕");
    audioElement.src = reader.result;
    //track = audioContext.createMediaElementSource(audioElement);
    track.connect(audioContext.destination);
    track.connect(gain).connect(audioContext.destination);
});*/
fileElement.addEventListener("change", () => {
    audioElement.pause();
    playButton.dataset.playing = "false";
    playIcon.className = "fa fa-play"
    //fileElement = document.getElementById("files");
    //audioElement = document.getElementById("audio");
    console.log("开始解析");
    var audioUrl = URL.createObjectURL(fileElement.files[0]);
    console.log("解析完毕");
    audioElement.src = audioUrl;
    track.connect(audioContext.destination);
    track.connect(gain).connect(audioContext.destination);
    addProgress();
});

toggleMenu.addEventListener("mousedown", dblclick(showmenu, "menu"));
ctrlMenu.addEventListener("click", showmenu);

ctrlFullscreen.addEventListener("click", fullscreen);
toggleFullscreen.addEventListener("mousedown", dblclick(fullscreen, "fullscreen"));

replay.addEventListener("click", restartProgress);
toggleReplay.addEventListener("mousedown", dblclick(restartProgress, "replay"));

getStylesButton.addEventListener("click", () => {
    styleEditor.value = getStyles();
});

commitButton.addEventListener("click", () => {
    var value = styleEditor.value.split(";\n");
    var commitStyles = "";
    //防止用户提交非法样式
    for (const i in value) {
        if (i.split(": ")[0].match("--")) {
            commitStyles += `${i};`;
        }
    }
    root.setAttribute("style", commitStyles);
});

progressBar.addEventListener("touchstart", stopProgress);
progressBar.addEventListener("touchend", startProgress);
progressBar.addEventListener("mousedown", stopProgress);
progressBar.addEventListener("mouseup", startProgress);

downloadStylesButton.addEventListener("click", downloadStyles);
refreshStyles.addEventListener("click", getStylesStore);

//定义相关函数功能

//显示/隐藏菜单
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

//全屏模式
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

//播放音频功能
function play() {
    try {
        //playButton = document.getElementById("play");
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

//将正在拖动的窗口置于最上面显示
function showFirst() {
    var thisWindow = this;
    window.setTimeout(() => {
        //var node = aboutWindow.cloneNode(true);
        var lastChild = windowContainer.lastElementChild;
        if (lastChild != thisWindow) {
            windowContainer.removeChild(thisWindow);
            windowContainer.appendChild(thisWindow);
        }
    }, 2);
}

//窗口的最大化方法
function windowFullscreen() {
    if (!alwaysFullscreen) {
        enableFullScreenMode();
    }
    else {
        disableFullScreenMode();
    }
}

//打开/关闭窗口
function showWindow() {
    document.getElementById(this.dataset.window).style.display = "block";
    showFirst.call(document.getElementById(this.dataset.window));
}

function closeWindow() {
    document.getElementById(this.dataset.window).style.display = "none";
    disableFullScreenMode();
}

//拖动相关功能
function startTouchDragging(e) {
    this.dataset.dragging = true;
    this.dataset.left = e.touches[0].pageX - document.getElementById(this.dataset.window).style.left.split("px")[0];
    this.dataset.top = e.touches[0].pageY - document.getElementById(this.dataset.window).style.top.split("px")[0];
}
function touchDragging(e) {
    if (this.dataset.dragging === "true" && useDragging) {
        this.style.cursor = "grabbing";
        document.getElementById(this.dataset.window).style.left = `${e.touches[0].pageX - this.dataset.left}px`;
        document.getElementById(this.dataset.window).style.top = `${e.touches[0].pageY - this.dataset.top}px`;
    }
}
function startMouseDragging(e) {
    this.dataset.dragging = "true";
    this.dataset.left = e.pageX - document.getElementById(this.dataset.window).style.left.split("px")[0];
    this.dataset.top = e.pageY - document.getElementById(this.dataset.window).style.top.split("px")[0];
}
function mouseDragging(e) {
    if (this.dataset.dragging === "true" && useDragging) {
        this.style.cursor = "grabbing";
        document.getElementById(this.dataset.window).style.left = `${e.pageX - this.dataset.left}px`;
        document.getElementById(this.dataset.window).style.top = `${e.pageY - this.dataset.top}px`;
    }
}
function finishDragging() {
    for (const elt of toolbars) {
        elt.dataset.dragging = "false";
        elt.style.cursor = "grab";
    }
}

//音频进度条相关功能
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

//获取样式
function getStyles() {
    var styles = window.getComputedStyle(root, null);
    var result = "";
    for (const i of styles) {
        if (i.match("--")) {
            result += `${i}: ${styles.getPropertyValue(i)};\n`;
        }
    }
    return result;
}

//判断颜色深浅
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

//下载样式
function downloadStyles() {
    var style = getStyles();
    download(style, "text/plain", "styles.txt");
}

//下载功能
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

//双击事件判断处理方法
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

//颜色选择器选择颜色
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

//选择背景类型
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

//清除或设置某个根元素的样式属性
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

//设置选择
function setSelection(selected,elements,selected_className,unselected_className) {
    for (const elt of elements) {
        elt.className = unselected_className;
    }
    selected.className += ` ${selected_className}`;
}

//获取样式库
async function getStylesStore() {
    if ((!domain) || (!stylesRepoName)) {
        console.error("Load failed")
        return false;
    }
    colorTheme.innerHTML = "";
    var filelist = await fetchText(`${domain}/${stylesRepoName}//list.txt`);
    filelist = filelist.split("\n");
    for (const file of filelist) {
        if (file != "") {
            generate(file);
        }
    }
}

//获取网页文本
async function fetchText(url) {
    const response = await fetch(url);
    const text = await response.text();
    return text;
}


//获取网页文件并将其本地化
async function fetchFile(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    const result = URL.createObjectURL(blob);
    return result;
}

//获取样式元数据
async function generate(file) {
    var meta = await fetchText(`${domain}/${stylesRepoName}//${file}/meta.json`);
    meta = JSON.parse(meta);
    generateStyleBox(file, meta);
}

//生成样式介绍栏
async function generateStyleBox(file, meta) {
    const element_image = document.createElement("div");
    const element_details = document.createElement("div");
    const element_title = document.createElement("div");
    const element_description = document.createElement("div");
    const element = document.createElement("div");
    generateStyleImage(file, meta, element_image, element);
    const style = await fetchText(`${domain}/${stylesRepoName}//${file}/${meta.styles}`);
    element.className = "style-box";
    element.dataset.style = style;
    element_details.className = "style-details";
    element_details.innerText = meta.description;
    element_title.className = "style-title";
    element_title.innerText = meta.name;
    element_description.className = "style-description";
    element_description.appendChild(element_title);
    element_description.appendChild(element_details);
    element.appendChild(element_description);
    colorTheme.appendChild(element);
    element.addEventListener("click",function(){
        root.setAttribute("style", this.dataset.style);
    });
}

//获取样式介绍图片
async function generateStyleImage(file, meta, element_image, element) {
    const image = await fetchFile(`${domain}/${stylesRepoName}//${file}/${meta.image}`);
    element_image.className = "style-image";
    element_image.style.backgroundImage = `url(${image})`;
    element.insertBefore(element_image, element.firstElementChild);
}

//禁用或启用窗口最大化
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

//设置定时循环程序
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