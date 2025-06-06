@echo off
echo 正在启动物联网运营平台前端服务...

:: 安装依赖
call npm install
 
:: 启动前端开发服务器
call npm run dev 