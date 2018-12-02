import { Form, Icon, Input, Button, Checkbox, Card, notification } from 'antd';
import React, { Component } from 'react';
import Api from '../api/common';

const FormItem = Form.Item;

class NormalLoginForm extends Component {

  constructor(props) {
    super(props);
  }

  openNotificationWithIcon = (type, name) => {
    notification[type]({
      message: name,
      icon: <Icon type="smile-circle" style={{ color: '#108ee9' }} />
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        Api.login({username: values.userName, password: values.password}).then(res => {
          if (!res) {
            this.openNotificationWithIcon('info', '用户名或密码错误')
          } else {
            localStorage.setItem('userInfo', JSON.stringify(res))
            this.props.history.push('/')
          }
        })
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div style={{width: '100%', height: '100vh', display:'flex', alignItems:'center',justifyContent:'center'}}>
      <Card title="登录" style={{width: '600px'}}>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <FormItem>
            {getFieldDecorator('userName', {
              initialValue: 'user2',
              rules: [{ required: true, message: '请输入用户名' }],
            })(
              <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="请输入用户名"
              />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              initialValue: '123',
              rules: [{ required: true, message: '请输入密码' }],
            })(
              <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="请输入密码" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(
              <Checkbox>记住密码</Checkbox>
            )}
            <Button type="primary" htmlType="submit" className="login-form-button">
              登陆
            </Button>
          </FormItem>
        </Form>
      </Card>
      </div>
    );
  }
}

const Login = Form.create()(NormalLoginForm);
export default Login
