
import Config from '../../../config'
// 交易类型：0：系统发放 1:铸币 2：token转账 3：消费 4：转换BTS',
export function getTransType (type) {
  switch (type) {
    case 0: return '系统发放';
    case 1: return '发行';
    case 2: return '转账';
    case 3: return '消费';
    case 4: return '兑换BTS';
    case 5: return '参与竞猜';
    case 6: return '竞猜奖励';
    default: return '-'
  }
}

export function getSymbol ({type, value}) {
  // 交易类型：0：系统发放 1:铸币 2：token转账 3：消费 4：转换BTS',
  switch (type) {
    case 0:
    case 6: return `+ ${value}`;
    case 1: return '-';
    case 2:
    case 3:
    case 4:
    case 5: return `- ${value}`;
    default: return '-'
  }
}

export function formatDate (date) {
  const n = new Date(date)
  function format (value) {
    return value < 10 ? `0${value}` : value
  }
  return `${n.getFullYear()}-${format(n.getMonth()+1)}-${format(n.getDate())} ${format(n.getHours())}:${format(n.getMinutes())}:${format(n.getSeconds())}`
}

export const explorer = `${Config.explorer}#/tx/`