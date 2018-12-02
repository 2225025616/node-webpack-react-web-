import React, {Component} from 'react'
import { Card, Form, Input, Tooltip, Icon, Cascader, DatePicker,
  Select, Row, Col, Checkbox, Button, AutoComplete, notification } from 'antd';
import api from '../../api/guessGame';

const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;

class GuessForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      gameInfo: {}
    };
  }

  componentWillMount () {
    this.latestGame()
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);

        let params = {
          start: Number.parseInt(new Date(values['range-picker'][0]).getTime() / 1000),
          end: Number.parseInt(new Date(values['range-picker'][1]).getTime() / 1000),
          max: values.max
        }

        this.createGame(params);
      }
    });
  }

  // 获取最新的游戏
  latestGame = () => {
    api.latestGame().then(res => {
      this.setState({
        gameInfo: res.data.result[0]
      })
    })
  }

  openNotificationWithIcon = (type, name) => {
    notification[type]({
      message: `${name}`,
      icon: <Icon type="smile-circle" style={{ color: '#108ee9' }} />
    });
  };

  // 给用户发放代币
  createGame = ({start, end, max}) => {
    api.createGame({start, end, max}).then(res => {
      this.latestGame();
    })
  }

  // 结束竞猜
  endGame = () => {
    const gameId = this.state.gameInfo.id;
    const gameValue = (Math.random() >= 0.5) ? 1 : 2
    api.endGame({gameId, gameValue}).then(res => {
      this.openNotificationWithIcon('success', '竞猜结束')
      let info = this.state.gameInfo
      this.setState({
        gameInfo: {
          ...info,
          result: gameValue
        }
      })
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 14,
          offset: 6,
        },
      },
    };
    const rangeConfig = {
      rules: [{ type: 'array', required: true, message: '请选择开始/结束时间!' }],
    };
    return (
      <div>
        <Card title="创建合约" className="card">
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label="竞猜最大金额"
              hasFeedback
            >
              {getFieldDecorator('max', {
                rules: [{ required: true, message: '请输入金额' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="选择时间"
            >
              {getFieldDecorator('range-picker', rangeConfig)(
                <RangePicker />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="验证码">
              <Row gutter={8}>
                <Col span={12}>
                  {getFieldDecorator('vscode', {
                    rules: [{ required: true, message: '请输入验证码！' }],
                  })(
                    <Input size="large" />
                  )}
                </Col>
                <Col span={12}>
                  <Button size="large">获取验证码</Button>
                </Col>
              </Row>
            </FormItem>
            <FormItem {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit">确认创建竞猜合约</Button>
            </FormItem>
          </Form>
        </Card>
        <Card title="当前竞猜" className="card">
          <p>游戏名称: <span style={{fontWeight: 'bold'}}>{this.state.gameInfo.gameName ? this.gameInfo.gameName:'竞猜游戏'}</span></p>
          <p>竞猜最大金额: <span style={{fontWeight: 'bold'}}>{this.state.gameInfo.amount}</span></p>
          {this.state.gameInfo.result>0 && <p>竞猜结果: <span style={{fontWeight: 'bold'}}>{this.state.gameInfo.result===1?'涨':'跌'}</span></p>}
          {this.state.gameInfo.result?
            <Button type="primary" disabled onClick={()=>this.endGame()}>竞猜已结束</Button>:
            <Button type="primary" onClick={()=>this.endGame()}>结束竞猜</Button>
          }
        </Card>
      </div>
    );
  }
}

const WrappedRegistrationForm = Form.create()(GuessForm);

export default WrappedRegistrationForm
