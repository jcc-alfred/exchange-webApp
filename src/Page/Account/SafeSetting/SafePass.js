import React from 'react';
import { Http, config, Store, Utils } from '../../../Base'
import { message, Form, Input, Button, Col } from 'antd';
import { Link } from 'react-router-dom';
import lang from '../../../Lang'

const formItemLayout = {
    labelCol: {
        sm: { span: 8 },
    },
    wrapperCol: {
        sm: { span: 10 },
    },
};

class SafePass extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            googleCode:{},
            oldIsDisabled:false,
            oldCodeText:lang.get('获取验证码'),
        };
        this.userInfo = Store.get(config.store.userInfo);
        this.isBind = this.userInfo.is_safe_pass ? false : true;

        this.codeType = Utils.getSendCodeType(this.userInfo);
    }
        
    validator_code(rule,value,callback){
        if(!value){
            callback(lang.get('请输入验证码'));
        }
        else if(value && value.length===6 ){
            callback();
        }else{
            callback(lang.get('验证码格式错误'));
        }
    }
    validator_pass(rule,value,callback){
        if(!value){
            callback(lang.get('请输入资金密码'));
        }
        else if(value && Utils.getPassLevel(value)){
            callback();
        }else{
            callback(lang.get('资金密码格式错误'));
        }
    }
    validator_repass(rule,value,callback){

        let pass = this.isBind ? this.props.form.getFieldValue('safePass') : this.props.form.getFieldValue('newSafePass');

        if(!value){
            callback(lang.get('请再次输入资金密码'));
        }
        else if(value && value === pass){
            callback();
        }else{
            callback(lang.get('两次密码输入不一致'));
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

    event_submit(e){
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            global.WebApp.loading.show();

            let params = {};
            let res = {};
            if (this.isBind) {
                params.safePass = values.safePass
                if(this.codeType === "email"){
                    params.emailCode = values.code;
                }else{
                    params.phoneCode = values.code;
                }
                params.googleCode = values.googleCode;
              
                res = await Http.post(config.api.addSafePass, params);
            } else {
                params.safePass = values.safePass;
                params.newSafePass = values.newSafePass

                if(this.codeType === "email"){
                    params.emailCode = values.code;
                }else{
                    params.phoneCode = values.code;
                }

                params.googleCode = values.googleCode;
                res = await Http.post(config.api.modifySafePass, params);
            }

            global.WebApp.loading.hide();

            if (res.code===1) {
                message.success(lang.get('设置成功'));
                this.props.history.goBack()
            } else {
                message.error(lang.get(res.msg));
            }
        })
    }

    renderModify(){
        return  <Form className="m_form" onSubmit={this.event_submit.bind(this)}>

            <Form.Item
                {...formItemLayout}
                label={<span>{lang.get('原资金密码')}</span>}
                colon={false}
            >
                {this.props.form.getFieldDecorator('safePass',
                    {rules:[{validator:this.validator_pass.bind(this)}]}
                )(<Input  type="password" size="large" maxLength={30}  placeholder={lang.get('资金密码')} />)}
                
            </Form.Item>
            
            <Form.Item
                {...formItemLayout}
                label={<span>{lang.get('新资金密码')}</span>}
                colon={false}
            >
                {this.props.form.getFieldDecorator('newSafePass',
                    {rules:[{validator:this.validator_pass.bind(this)}]}
                )(<Input  type="password" size="large" maxLength={30}  placeholder={lang.get('新资金密码')} />)}
                
            </Form.Item>

            <Form.Item
                {...formItemLayout}
                label={<span>{lang.get('确认资金密码')}</span>}
                colon={false}
            >
                {this.props.form.getFieldDecorator('reSafePass',
                    {rules:[{validator:this.validator_repass.bind(this)}]}
                )(<Input  type="password" size="large" maxLength={30}  placeholder={lang.get('确认资金密码')} />)}
                
            </Form.Item>
            
            <Form.Item {...formItemLayout} label={<span>{this.codeType === 'email' ? lang.get('邮箱验证码') : lang.get('手机验证码')}</span>} colon={false} key={2}>
                <Col span={16}>
                    {this.props.form.getFieldDecorator('code', {
                        rules: [{ validator: this.validator_code.bind(this) }]
                    })(
                        <Input size="large" style={{ width: "100%" }} maxLength={6} placeholder={this.codeType === 'email' ? lang.get('邮箱验证码') : lang.get('手机验证码')} />
                    )}
                </Col>
                <Col span={8}>
                    <Button disabled={this.state.oldIsDisabled} onClick={this.event_getOldCode.bind(this, this.codeType)} size="large" style={{ width: "93%", marginLeft: "10px", "padding": "0 10px" }} >{lang.get(this.state.oldCodeText)}</Button>
                </Col>
            </Form.Item>
            
            { !!this.userInfo.google_secret && <Form.Item
                {...formItemLayout}
                label={<span>{lang.get('Google 验证码')}</span>}
                colon={false}
            >
                {this.props.form.getFieldDecorator('googleCode',
                    {rules:[{validator:this.validator_code.bind(this)}]}
                )(<Input size="large" maxLength={30}  placeholder={lang.get('Google 验证码')} />)}
                
            </Form.Item> }

            <Form.Item
                {...formItemLayout}
                label={<span></span>}
                colon={false}
                style={{ textAlign: 'center' }}
            >

                <Button size="large" type="primary" htmlType="submit" style={{ width: "100%", color: '#fff' }} >{lang.get('确认')}</Button>
                <div style={{textAlign:'left'}}><Link to="/account/safeSetting/SafeResetPass">{lang.get('找回资金密码')}</Link></div>
            </Form.Item>
        </Form>
    }

    renderBind(){
        return  <Form className="m_form" onSubmit={this.event_submit.bind(this)}>

            <Form.Item
                {...formItemLayout}
                label={<span>{lang.get('资金密码')}</span>}
                colon={false}
            >
                {this.props.form.getFieldDecorator('safePass',
                    {rules:[{validator:this.validator_pass.bind(this)}]}
                )(<Input  type="password" size="large" maxLength={30}  placeholder={lang.get('资金密码')} />)}
                
            </Form.Item>

            <Form.Item
                {...formItemLayout}
                label={<span>{lang.get('确认密码')}</span>}
                colon={false}
            >
                {this.props.form.getFieldDecorator('reSafePass',
                    {rules:[{validator:this.validator_repass.bind(this)}]}
                )(<Input  type="password" size="large" maxLength={30}  placeholder={lang.get('确认密码')} />)}
                
            </Form.Item>
            
            <Form.Item {...formItemLayout} label={<span>{this.codeType === 'email' ? lang.get('邮箱验证码') : lang.get('手机验证码')}</span>} colon={false} key={2}>
                <Col span={16}>
                    {this.props.form.getFieldDecorator('code', {
                        rules: [{ validator: this.validator_code.bind(this) }]
                    })(
                        <Input size="large" style={{ width: "100%" }} maxLength={6} placeholder={this.codeType === 'email' ? lang.get('邮箱验证码') : lang.get('手机验证码')} />
                    )}
                </Col>
                <Col span={8}>
                    <Button disabled={this.state.oldIsDisabled} onClick={this.event_getOldCode.bind(this, this.codeType)} size="large" style={{ width: "93%", marginLeft: "10px", "padding": "0 10px" }} >{lang.get(this.state.oldCodeText)}</Button>
                </Col>
            </Form.Item>
            
            { !!this.userInfo.google_secret && <Form.Item
                {...formItemLayout}
                label={<span>{lang.get('Google 验证码')}</span>}
                colon={false}
            >
                {this.props.form.getFieldDecorator('googleCode',
                    {rules:[{validator:this.validator_code.bind(this)}]}
                )(<Input size="large" maxLength={30}  placeholder={lang.get('Google 验证码')} />)}
                
            </Form.Item> }

            <Form.Item
                {...formItemLayout}
                label={<span></span>}
                colon={false}
                style={{ textAlign: 'center' }}
            >

                <Button size="large" type="primary" htmlType="submit" style={{ width: "100%", color: '#fff' }} >{lang.get('确认')}</Button>

            </Form.Item>
        </Form>
    }



    render() {
        return <div className="box_right">

            <div className="box_right_box">
                <div className="header_title">
                    <div className="line_div">
                        <div className="slider_fang"></div>
                        <div className="up_text"><span>{this.isBind ? lang.get('设置资金密码') : lang.get('修改资金密码')}</span></div>
                    </div>
                </div>
                <div className="right_form">
                    {this.isBind ? this.renderBind() : this.renderModify()}
                </div>
            </div>
        </div>
    }
    componentWillUnmount(){
        clearInterval(this.newTimer);
        clearInterval(this.oldTimer);
    }
}

export default Form.create()(SafePass);