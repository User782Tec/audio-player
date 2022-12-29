# Audio Player

一个多功能的在线音频播放器

## 介绍

本项目为一个在线的多功能音频播放器，属于个人兴趣项目，仅用于学习和测试。

此项目主要是由User782tec（user782，以下简称782）编写的。

由于需要进行重构，近期代码改动可能较大。

### 特别感谢

* 感谢Font Awesome4提供的图标！

### 友情链接

#### 项目仓库网址

gitee上本项目仓库的备份：<https://gitee.com/user-782/audio-player>

GitHub上的本项目仓库地址：<https://github.com/User782Tec/audio-player>

GitHub上存储本项目颜色主题的仓库：<https://github.co/User782Tec/audio-player-styles-repo>

#### Pages网页网址

Netlify上构建的Pages：<https://782-audio-player.netlify.app/>

GitHub上构建的Pages：<https://user782tec.github.io/audio-player/>

Cloudflare上构建的Pages：<https://audio-player.pages.dev/>

### 主要功能

将文件上传至网页后，用户可以控制相关的配置，并在线播放音频。

## 更新日志

### 0.4.2 - beta

#### 新内容

* 新增了下载样式配置的功能。
  * 但暂时不支持上传文件。
* 新增了渐变色背景的部分功能。
* 新增了设置窗口的部分内容。
* 新增了商店窗口。
  * 但并没有任何内容，下载颜色主题的功能也将由外观与个性化窗口暂时接替。
* 在菜单上新增了“设置”和“商店”按钮。
* 新增了“下拉菜单”控件。
* 新增了部分颜色主题商店的脚本功能。
* 新增了应用图标和Web App（实验性功能）。

#### 更改

* 继续完善了高级样式修改接口。
* 将部分“变量”声明为常量。
* 将双击操作功能提取到独立函数内。
* “更多颜色”选色器上会显示“···”并根据自身颜色调整颜色。
* 将docs/css/style.css与styles/style.css合并。
  * 并未删除原文件。
* 修改了外观窗口“修改样式（开发者）”中的按钮名称。
  * 名称更为简短以适配小型屏幕。
* 更新了菜单部分样式。
* 将“外观”更名为“外观与个性化”。
* 更改了文本输入框内的字体。
* 禁用了用户对文本输入框调整大小的功能。
* 对小屏设备上窗口的进行了进一步的优化。
  * 现在对高度小的屏幕同样为窗口启用“全屏模式”。
* 在可交互的元素上悬浮鼠标时，鼠标会变成“pointer”样式。
* 修改了颜色深浅判断的方法。

#### 修复

* 修复了在窗口操作时可意外触发其他事件的问题。
* 修复了高级样式按钮位置偏移的问题。
* 修复了部分情况下窗口“全屏模式”按钮更新不及时的问题。
* 修复了下拉菜单有时被其他元素遮挡的问题。
* 修复了背景色选择时无法覆盖背景图的问题。

#### 已移除

* 移除了菜单上的外观按钮。

### 0.4.1 - 2022.12.17

0.4.1版本主要更新了窗口上的“全屏模式”和进度条的部分功能，更改了部分内容并修复了一些问题。

#### 新内容

* 为所有窗口新增了“全屏模式”的按钮。
* 新增了优先显示被拖动的窗口的功能。
* 新增了窗口上“全屏模式”的按钮根据模式调整的功能。
* 新增了光标会在窗口可拖动时改变图标的功能（实验性功能）。
* 新增了进度条的部分功能。

#### 更改

* 为html文档启用了DOCTYPE声明。
* 打开窗口时会同时让相应窗口置顶显示的功能。
* 文件将会被解析为Blob，而不再是DataURL。

#### 修复

* 现只禁止在根元素上触发触摸滚动放大以修复窗口内容无法滚动的问题。
* 将文档移到index.html中以修复由于网络原因导致拖动窗口时窗口里的内容会暂时不显示的问题。
  * 并未删除原文件。
* 修复了部分情况下窗口处在“全屏模式”下会超出页面大小的问题。
* 修复部分情况下窗口拖动功能失效的问题。

#### 优化

* 优化了给窗口绑定事件的函数和代码，更加简洁。

#### 已移除

* 移除了小屏设备浏览时弹出的提示。
* 移除了关于窗口的全屏模式伪类样式。

### 0.4.0 - 2022.12.10

0.4.0版本主要更新了修改背景颜色的功能，更改部分内容并修复了部分问题。

#### 新内容

* 新增了修改背景的部分功能。
* 新增了“外观”窗口。
* 新增了小屏设备浏览时弹出提示的功能。
* 为窗口工具栏、按钮等元素新增“data-window”属性。
  * 用于下一版本的对窗口事件绑定代码的优化。
* 为窗口新增全屏按钮以随时启用“全屏模式”（窗口面积会占据整个页面大小）。
  * 该功能为实验性功能，暂未实装在所有窗口上。

#### 修复

* 修复了部分情况下音频会意外地自动播放的问题。
* 禁用触摸操作以修复触摸设备上拖动窗口时触发其他事件（如下拉刷新等）的问题。
* 修复了窗口超出页面范围后出现滚动条的问题。
* 修复了窗口文字过小的问题。
* 修复了双击操作的空间会影响其他按钮点击的问题。

#### 更改

* 更新一些样式使其更加美观。
* 为菜单及按钮重设了响应式设计以更好地适配小屏设备。
* 用“transition”取代了所有“animation”。
* 更改了拖动窗口时定位的方法。
* 更改了双击事件的判断方法。
* 调整了窗口的样式。
* 继续更改了响应式设计。
  * 窗口在小屏设备上会启用“全屏模式”（窗口面积会占据整个页面大小）。

#### 已移除

* 移除了鼠标悬浮在菜单时的阴影效果。

### 0.3.0 - 2022.11.29

0.3.0版本主要更新了帮助信息，更改部分内容并修复了部分问题。

#### 新内容

* 新增了帮助的页面及窗口。
* 在菜单上新增“帮助”按钮。
* 新增了帮助页面的显示。

#### 更改

* 略微放大窗口的字体大小。
* 为窗口中的关闭按钮新增鼠标悬浮时的过渡动画。
* 略微减少窗口顶部工具栏的高度。
* 为窗口新增了响应式设计以适配小屏设备。
* 为JavaScript脚本启用“严格模式”。

### 修复

* 修复了触摸设备上“双击后页面放大”的问题。

#### 已移除

* 为了简化代码，移除了关于“全屏样式”伪类的所有样式。

### 0.2.0 - 2022.11.26

0.2.0版本作为0.1.0版本的补充，继续对0.1.0版本的欠缺内容进行补充，并为下一版本作准备。

#### 新内容

* 完成了基本窗口框架。
* 新增了关于本仓库的页面及窗口。
* 在菜单上新增“关于”按钮。
* 新增了项目信息的显示。

#### 更改

* 微调菜单按钮。
* 为菜单及按钮新增了响应式设计以适配小屏设备。

#### 修复

* ~~修复了移动端“双击后页面放大”的漏洞。~~
仍未修复。

#### 优化

* 优化了全屏功能的代码，简化函数。

#### 补丁

* 0.2.0.1 -- 2022.11.26
  * 重新优化了全屏功能的代码以修复“非法调用（Illegal invocation）”的问题。
  * 初始化main主元素的背景色为白色。

### 0.1.0 - 2022.11.21

0.1.0版本是此项目的第一个版本。此次更新完成基本框架，新增了一些基础内容与功能。

#### 新内容

* 新增基础样式、页面元素和脚本。
* 新增上传文件、播放/暂停、全屏模式、双击操作等基本功能。
