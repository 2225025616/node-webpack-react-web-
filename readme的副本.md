#中信证券积分系统-poc

开发版本
node v9.10.1
npm 5.6.0

安装
```bash
cp config.example.js config.js
npm install
npm start
```

文件说明
```
├── abi                         合约ABI接口目录，可以通过solidity在线编译获取
├── config.example.js           配置文件模板
├── config.js                   实际配置文件
├── contracts                   合约目录
├── lib                         类目录
│   ├── db.js                   mysql连接池
│   ├── router.js               web路由配置
│   └── web3.js                 geth链接
├── model                       具体业务目录
├── server.js                   main入口
```
