create table if not exists `addresses`  (
  `id` int(11) UNSIGNED not NULL AUTO_INCREMENT,
  `userId` int(11) not null default 0,

  `userName` varchar(32) DEFAULT NULL,
  `mobile` int(11) DEFAULT NULL,
  `passwd` varchar(255) DEFAULT NULL,

  `public` varchar(255) not NULL default '',
  `private` char(66) not null default '',
  `btsAccount` varchar(1024) not null default '' comment 'BTS账户名称，一般为字母加数字',

  `createdAt` datetime not null DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime not null DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  unique INDEX `public`(`public`),
  unique INDEX `userId`(`userId`),
  INDEX `btsAccount`(`btsAccount`)
)engine=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='用户地址表';

CREATE TABLE if not exists `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transId` int(11) NOT NULL comment '外部交易号',
  `fromUserId` int(11) NOT NULL DEFAULT 0,
  `toUserId` int(11) NOT NULL DEFAULT 0,
  `amount` varchar(1024) NOT NULL,
  `transHash` varchar(255) NOT NULL DEFAULT "" comment '交易hash',
  `type` tinyint(4) NOT NULL DEFAULT 0 comment '交易类型：0：系统发放 1：铸币 2：token转账 3：消费 4：转换BTS 5：参与竞猜 6：收回竞猜收益',
  `subtype` tinyint(4) NOT NULL DEFAULT 0 comment '子交易类型：例如系统发放有：登陆/签到等',
  `status` tinyint(4) NOT NULL DEFAULT 0 comment '1交易已经Appending',

  `createdAt` datetime not null DEFAULT CURRENT_TIMESTAMP comment '交易记录时间',

  PRIMARY KEY (`id`),
  UNIQUE KEY `transId` (`transId`) USING BTREE,
  KEY `transHash` (`transHash`),
  KEY `transId_2` (`transId`, `toUserId`)
) ENGINE=InnoDB AUTO_INCREMENT=169 DEFAULT CHARSET=utf8 comment='交易表';



create table if not exists `guess_games` (
  `id` int(11) not null AUTO_INCREMENT,
  `startTime` varchar(20) not null,
  `endTime` varchar(20) not null,
  `result` int(1) default  0,
  `amount` varchar(1024) default NULL,
  `createdAt` datetime not null DEFAULT CURRENT_TIMESTAMP comment '游戏创建时间',
  `updatedAt` datetime not null DEFAULT CURRENT_TIMESTAMP comment '游戏更新时间',
  PRIMARY KEY (id)
)engine=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='竞猜游戏表';


create table if not exists `guess_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) not null,
  `gameId` int(11) not null,
  `value` int(1) default  0,
  `amount` varchar(1024) default NULL,
  `createdAt` datetime not null DEFAULT CURRENT_TIMESTAMP comment '竞猜时间',
  `getAt` datetime not null comment '领奖时间',
  PRIMARY KEY (id)
)engine=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='竞猜记录表';
