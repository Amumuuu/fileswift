# FileSwift 官网维护（V7.3）

官网：https://fileswift.cn
仓库：https://github.com/Amumuuu/fileswift
当前安装包：https://github.com/Amumuuu/fileswift/releases/tag/v7.3

## 升版与替换下载地址

1. 在 GitHub Releases 创建新版本，上传安装程序。文件名建议使用英文，例如 FileSwift_Setup.exe。
2. 修改仓库根目录 download-config.js 的 version、fileswiftDirectUrl、backupUrl。
3. 提交到 main，等待 GitHub Pages 发布完成。

加速地址由 ghfast.top 前缀与 fileswiftDirectUrl 自动拼接。只换百度网盘时，仅修改 backupUrl。公益加速服务可能波动，不保证所有地区都更快；页面保留 GitHub 与百度网盘两条备用下载入口。

## 网页文案与截图

文案在 index.html，功能截图映射在 app.js 的 screenshots 数组。PNG 资产位于 assets。替换图片后同步更新对应 width、height 和说明。

当前依次为：文件批量查找、图纸智能处理、CAD快捷看图、批量改名工具、加密图纸破解。六张例图均为用户提供的 V7.3 截图。页面使用无损 WebP，点击放大加载高清 PNG；新版 Logo 与 favicon 已同步替换。

本地根目录与 GitHub上传文件 是发布版副本；V7.3本地预览 是预览副本。文件在本地修改后不会自动同步到 GitHub。

## 本次安装包校验

文件名：FileSwift_Setup.exe
大小：234212156 字节
SHA-256：55b03d954b46052cb90a42c87bd147548ce7679717347607976847214bd2825a
