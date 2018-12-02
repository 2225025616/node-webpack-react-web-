import React, {Component} from 'react'
import { Card, Form, Input, Tooltip, Icon, Cascader, notification,
  Select, Row, Col, Checkbox, Button, AutoComplete } from 'antd';
import api from '../../api/crm';

const FormItem = Form.Item;

class RegistrationForm extends Component {
  state = {
    confirmDirty: false
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        const {userName, amount} = values
        this.sendToken({userName, amount})
      }
    });
  }

  // 给用户发放代币
  sendToken = ({userName, amount}) => {
    api.distribute({userName, amount}).then(res => {
      console.log(res)
      this.openNotificationWithIcon('success', '发放成功');
    })
  }

  openNotificationWithIcon = (type, name) => {
    notification[type]({
      message: `${name}`,
      icon: <Icon type="smile-circle" style={{ color: '#108ee9' }} />
    });
  };

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
      <Card title="发放" className="card">
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label="发放账户名"
            hasFeedback
          >
            {getFieldDecorator('userName', {
              rules: [{
                required: true, message: '请输入发放账户名',
              }],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="发放数量"
            hasFeedback
          >
            {getFieldDecorator('amount', {
              rules: [{ required: true, message: '请输入发放数量' }],
            })(
              <Input />
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
            <Button type="primary" htmlType="submit">确认发放</Button>
          </FormItem>
        </Form>
      </Card>
    );
  }
}

class MintForm extends Component {
  state = {
    confirmDirty: false
  };

  handleMintSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        const amount = values.mintAmount
        this.mintToken({amount})
      }
    });
  }

  // 铸币
  mintToken = ({amount}) => {
    api.mintToken({amount}).then(res => {
      this.openNotificationWithIcon('success', '发行成功');
    })
  }

  openNotificationWithIcon = (type, name) => {
    notification[type]({
      message: `${name}`,
      icon: <Icon type="smile-circle" style={{ color: '#108ee9' }} />
    });
  };
  
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
      <div>
        <Card title="发行Token" className="card">
          <Form onSubmit={this.handleMintSubmit}>
            <FormItem
              {...formItemLayout}
              label="发行数量"
              hasFeedback
            >
              {getFieldDecorator('mintAmount', {
                rules: [{ required: true, message: '请输入发行数量' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="验证码">
              <Row gutter={8}>
                <Col span={12}>
                  {getFieldDecorator('mintVscode', {
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
              <Button type="primary" htmlType="submit">确认发行</Button>
            </FormItem>
          </Form>
        </Card>
      </div>
    );
  }
}

const WrappedRegistrationForm = Form.create()(RegistrationForm);
const MintRegistrationForm = Form.create()(MintForm);

class SendToken extends Component {
  render() {
    return (
      <div>
        <WrappedRegistrationForm/>
        <MintRegistrationForm/>
      </div>
    )
  }
}

export default SendToken
