import React, {Component} from 'react'
import { Card, Form, Input, Row, Col, Button, notification, Icon, InputNumber } from 'antd';
import api from '../../api/wallet';

const FormItem = Form.Item;

class RegistrationForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      balance: 0
    }
  }

  componentWillMount() {
    let address = JSON.parse(localStorage.getItem('userInfo')).public
    this.getBalance(address)
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {address, quantity} = values
        this.sendToken({address, quantity})
      }
    });
  }

  getBalance = (address) => {
    api.getBalance({address}).then(res => {
      this.setState({balance: res})
    }).catch(err => {
      console.log(err)
    })
  }

  openNotificationWithIcon = (type, name) => {
    notification[type]({
      message: `${name}`,
      icon: <Icon type="smile-circle" style={{ color: '#108ee9' }} />
    });
  };

  sendToken = ({address, quantity}) => {
    api.transformToken({address, quantity}).then(res => {
      this.openNotificationWithIcon('success', '转账成功')
    }).catch(err => {
      console.log(err)
      // this.openNotificationWithIcon('error', '转账失败')
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

    return (
      <Card title="转账" className="card">
      <Form onSubmit={this.handleSubmit}>
        <FormItem
          {...formItemLayout}
          label="转账地址"
        >
          {getFieldDecorator('address', {
            rules: [{
              required: true, message: '请输入转账地址',
            }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="转账数量"
        >
          {getFieldDecorator('quantity', {
            rules: [{ required: true, message: '请输入转账数量' }],
          })(
            <div>
              <InputNumber style={{width: '100%'}} min={0} max={this.state.balance}/>
              <p style={{marginBottom: '-20px'}}>当前账户余额：<span style={{"fontWeight": 'bold'}}>{this.state.balance}</span></p>
            </div>
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
          <Button type="primary" htmlType="submit">确认转账</Button>
        </FormItem>
      </Form>
      </Card>
    );
  }
}

const TransformForm = Form.create()(RegistrationForm);

export default TransformForm
