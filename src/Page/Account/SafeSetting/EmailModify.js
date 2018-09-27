import React from 'react';
import { message, Form, Input, Button, Col } from 'antd';
import lang from '../../../Lang'
import { Http, config, Store, Utils } from '../../../Base'

const formItemLayout = {
    labelCol: {
        sm: { span: 8 },
    },
    wrapperCol: {
        sm: { span: 10 },
    },
};

class EmailModify extends React.Component {

    constructor(props) {
        super(props);

        this.userInfo = Store.get(config.store.userInfo);
        this.state = {

            newIsDisabled: false,
            newCodeText: lang.get('获取验证码'),

            oldIsDisabled: false,
            oldCodeText: lang.get('获取验证码'),

            areaList: [],
            areaCode: '+86'
        }

        this.isBind = this.userInfo.email ? false : true;

    }

    validator_code(rule, value, callback) {
        if (!value) {
            callback(lang.get('请输入验证码'));
        }
        else if (value && value.length === 6) {
            callback();
        } else {
            callback(lang.get('验证码格式错误'));
        }
    }

    validator_email(rule, value, callback) {

        if (!value) {
            callback(lang.get('请输入邮箱'));
        }
        else if (value && Utils.isEmail(value)) {
            callback();
        }
        else {
            callback(lang.get('邮箱格式错误'));
        }
    }

    async componentDidMount() {
        let areaList = await import(/* webpackChunkName: "Base/area_code" */ '../../../Base/area_code');
        this.setState({ areaList: areaList.default });
    }

    async event_getCode(type, e) {

        let from = this.props.form;

        if (type === 'phone') {
            from.validateFields(['phoneNumber'], async (err) => {

                if (err) {
                    return;
                }

                this.setState({ newIsDisabled: true })

                let phoneNumber = this.props.form.getFieldValue('phoneNumber')
                let areaCode = this.state.areaCode.replace('+', '');
                let params = {};
                params.type = "phone";
                params.areaCode = areaCode;
                params.phoneNumber = phoneNumber;

                let res = await Http.post(config.api.sendCode, params);
                if (res.code === 1) {
                    message.success(lang.get('验证码发送成功'), 2);
                    let timer = 60;
                    this.setState({ newCodeText: timer + 's' })

                    this.newTimer = setInterval(function () {
                        if (timer - 1 < 0) {
                            clearInterval(this.newTimer);
                            this.setState({
                                newCodeText: lang.get('获取验证码'),
                                newIsDisabled: false,
                            })
                        } else {
                            timer--;
                            this.setState({ newCodeText: timer + 's', })
                        }
                    }.bind(this), 1000)

                } else {
                    message.error(lang.get(res.msg), 2);
                    this.setState({ newIsDisabled: false })
                }
            });

        } else {
            from.validateFields(['email'], async (err) => {
                if (err) {
                    return;
                }

                this.setState({ newIsDisabled: true })

                let params = {};
                params.type = "email";
                params.email = this.props.form.getFieldValue('email');

                let res = await Http.post(config.api.sendCode, params);


                if (res.code === 1) {
                    message.success(lang.get('验证码发送成功'), 2);
                    let timer = 60;
                    this.setState({ newCodeText: timer + 's' });

                    this.newTimer = setInterval(function () {
                        if (timer - 1 < 0) {
                            clearInterval(this.newTimer);
                            this.setState({
                                newCodeText: lang.get('获取验证码'),
                                newIsDisabled: false,
                            })
                        } else {
                            timer--;
                            this.setState({ newCodeText: timer + 's' })
                        }
                    }.bind(this), 1000)

                } else {
                    message.error(lang.get(res.msg), 2);
                    this.setState({ newIsDisabled: false })
                }
            })
        }
    }

    async event_getOldCode(type, e) {
        let params = {};

        if (type === "phone") {
            params.type = "phone";
            params.areaCode = this.userInfo.area_code;
            params.phoneNumber = this.userInfo.phone_number;
        } else {
            params.type = "email";
            params.email = this.userInfo.email;
        }

        let res = await Http.post(config.api.sendCode, params);

        this.setState({ oldIsDisabled: true })

        if (res.code === 1) {
            message.success(lang.get('验证码发送成功'), 2);

            let timer = 60;
            this.setState({ oldCodeText: timer + 's' })

            this.oldTimer = setInterval(function () {
                if (timer - 1 < 0) {
                    clearInterval(this.oldTimer);
                    this.setState({
                        oldCodeText: lang.get('获取验证码'),
                        oldIsDisabled: false,
                    })

                } else {
                    timer--;
                    this.setState({
                        oldCodeText: timer + 's',
                    })
                }
            }.bind(this), 1000)

        } else {
            message.error(lang.get(res.msg), 2);
            this.setState({ oldIsDisabled: false })
        }

    }

    async event_submit(e) {

        e.preventDefault();

        this.props.form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            global.WebApp.loading.show();

            let params = {};
            let res = {};
            if (this.isBind) {
                params.accountType = 'email';
                params.email = values.email;
                params.emailCode = values.emailCode;
                params.phoneCode = values.phoneCode;
                params.googleCode = values.google;
                res = await Http.post(config.api.addAccount, params);
            } else {
                params.accountType = 'email';
                params.email = values.email;
                params.emailCode = values.emailCode;
                params.newEmailCode = values.newEmailCode;
                params.googleCode = values.google;
                res = await Http.post(config.api.modifyAccount, params);
            }

            global.WebApp.loading.hide();

            if (res.code) {
                message.success(lang.get('设置成功'));
                this.props.history.goBack()
            } else {
                message.error(lang.get(res.msg));
            }
        })

    }


    renderBind() {
        return [<Form.Item {...formItemLayout} label={<span>{lang.get('邮箱')}</span>} colon={false} key={0}>

            {this.props.form.getFieldDecorator('email', { rules: [{ validator: this.validator_email.bind(this) }] })(
                <Input size="large" maxLength={30} placeholder={lang.get('邮箱')} />
            )}

        </Form.Item>
            ,
        <Form.Item {...formItemLayout} label={<span>{lang.get('邮箱验证码')}</span>} colon={false} key={1}>
            <Col span={16}>
                {this.props.form.getFieldDecorator('emailCode', {
                    rules: [{ validator: this.validator_code.bind(this) }]
                })(
                    <Input size="large" style={{ width: "100%" }} maxLength={6} placeholder={lang.get('邮箱验证码')} />
                )}
            </Col>
            <Col span={8}>
                <Button disabled={this.state.newIsDisabled} onClick={this.event_getCode.bind(this, 'email')} size="large" style={{ width: "93%", marginLeft: "10px", "padding": "0 10px" }} >{lang.get(this.state.newCodeText)}</Button>
            </Col>
        </Form.Item>
            ,
        <Form.Item {...formItemLayout} label={<span>{lang.get('手机验证码')}</span>} colon={false} key={2}>
            <Col span={16}>
                {this.props.form.getFieldDecorator('phoneCode', {
                    rules: [{ validator: this.validator_code.bind(this) }]
                })(
                    <Input size="large" style={{ width: "100%" }} maxLength={6} placeholder={lang.get('手机验证码')} />
                )}
            </Col>
            <Col span={8}>
                <Button disabled={this.state.oldIsDisabled} onClick={this.event_getOldCode.bind(this, 'phone')} size="large" style={{ width: "93%", marginLeft: "10px", "padding": "0 10px" }} >{lang.get(this.state.oldCodeText)}</Button>
            </Col>
        </Form.Item>
        ]
    }

    renderModify() {
        return [
            <Form.Item {...formItemLayout} label={<span>{lang.get('新邮箱')}</span>} colon={false} key={0} >

                {this.props.form.getFieldDecorator('email', { rules: [{ validator: this.validator_email.bind(this) }] })(
                    <Input size="large" maxLength={30} placeholder={lang.get('新邮箱')} />
                )}

            </Form.Item>
            ,
            <Form.Item {...formItemLayout} label={<span>{lang.get('新邮箱验证码')}</span>} colon={false} key={1} >
                <Col span={16}>
                    {this.props.form.getFieldDecorator('newEmailCode', {
                        rules: [{ validator: this.validator_code.bind(this) }]
                    })(
                        <Input size="large" style={{ width: "100%" }} maxLength={6} placeholder={lang.get('新邮箱验证码')} />
                    )}
                </Col>
                <Col span={8}>
                    <Button disabled={this.state.newIsDisabled} onClick={this.event_getCode.bind(this, 'email')} size="large" style={{ width: "93%", marginLeft: "10px", "padding": "0 10px" }} >{lang.get(this.state.newCodeText)}</Button>
                </Col>
            </Form.Item>
            ,
            <Form.Item {...formItemLayout} label={<span>{lang.get('邮箱验证码')}</span>} colon={false} key={2}>
                <Col span={16}>
                    {this.props.form.getFieldDecorator('emailCode', {
                        rules: [{ validator: this.validator_code.bind(this) }]
                    })(
                        <Input size="large" style={{ width: "100%" }} maxLength={6} placeholder={lang.get('邮箱验证码')} />
                    )}
                </Col>
                <Col span={8}>
                    <Button disabled={this.state.oldIsDisabled} onClick={this.event_getOldCode.bind(this, 'email')} size="large" style={{ width: "93%", marginLeft: "10px", "padding": "0 10px" }} >{lang.get(this.state.oldCodeText)}</Button>
                </Col>
            </Form.Item>

        ];
    }

    render() {

        return <div className="box_right">

            <div className="box_right_box">
                <div className="header_title">
                    <div className="line_div">
                        <div className="slider_fang"></div>
                        <div className="up_text"><span>{this.isBind ? lang.get('绑定邮箱') : lang.get('修改邮箱')}</span></div>
                    </div>
                </div>
                <div className="right_form">

                    <Form className="m_form" onSubmit={this.event_submit.bind(this)}>

                        {this.isBind ? this.renderBind() : this.renderModify()}

                        {!!this.userInfo.google_secret && <Form.Item
                            {...formItemLayout}
                            label={<span>{lang.get('Google 验证码')}</span>}
                            colon={false}
                        >
                            {this.props.form.getFieldDecorator('google',
                                { rules: [{ validator: this.validator_code.bind(this) }] }
                            )(<Input size="large" maxLength={30} placeholder={lang.get('Google 验证码')} />)}

                        </Form.Item>}

                        <Form.Item
                            {...formItemLayout}
                            label={<span></span>}
                            colon={false}
                            style={{ textAlign: 'center' }}
                        >
                            <Button size="large" type="primary" htmlType="submit" style={{ width: "100%", color: '#fff' }} >{lang.get('确认')}</Button>

                        </Form.Item>

                    </Form>

                </div>
            </div>
        </div>
    }
    componentWillUnmount(){
        clearInterval(this.newTimer);
        clearInterval(this.oldTimer);
    }
}

export default Form.create()(EmailModify);