import React from 'react';
import { Form, Input, Button, Col ,message } from 'antd';
import {Store, config,Utils } from '../../Base';
import lang from './../../Lang';

const formItemLayout = {
    labelCol: {
        sm: { span: 6 },
    },
    wrapperCol: {
        sm: { span: 18 },
    },
};

class MailBox extends React.Component{

    constructor(props){
        super(props)
        this.codeText = lang.get('获取验证码')
        this.state = {
            codeIsloading:false,
            getCodeText:this.codeText,
            agreement:true,
            imgUrl:config.api.imgCode + '?v='+Math.random()
        };
    }

    validator_email(rule,value,callback){
        if(!value){
            callback(lang.get('请输入邮箱'));
        }
        else if(value && Utils.isEmail(value) && value.length>4){
            callback();
        }
        else{
            callback(lang.get('邮箱格式错误'));
        }
    }

    validator_emailCode(rule, value, callback){
        
        if(!value){
            callback(lang.get('请输入邮箱验证码'));
        }
        else if(value && Utils.isInt(value) && value.length===6){
            callback();
        }
        else{
            callback(lang.get('邮箱验证码错误'));
        }
    }

    validator_loginPass(rule,value,callback){
        if(!value){
            callback(lang.get('请输入登录密码'));
        }
        else if(value && Utils.getPassLevel(value)){
            callback();
        }else{
            callback(lang.get('登录密码格式错误'));
        }
    }

    validator_repass(rule,value,callback){
        if(!value){
            callback(lang.get('请再次输入登录密码'));
        }
        else if(value && value === this.props.form.getFieldValue('loginPass')){
            callback();
        }else{
            callback(lang.get('两次密码输入不一致'));
        }
    }
    validator_imgCode(rule,value,callback){
        if(!value){
            callback(lang.get('请输入验证码'));
        }
        else if(value && value.length===6 ){
            callback();
        }else{
            callback(lang.get('验证码格式错误'));
        }
    }

    validator_referralCode(rule,value,callback){
        if(!value || Utils.isInt(value)  ){
            callback();
        }else{
            callback(lang.get('推荐编码错误'));
        }
    }

    event_agreement(e){
        this.setState({agreement:!this.state.agreement});
    }

    event_refreshCode(){
        this.setState({imgUrl:config.api.imgCode + '?v='+Math.random()});
    }
    
    event_submit(e){
        e.preventDefault();
        if(!this.state.agreement){
            message.error(lang.get('请同意用户协议'));
        }
        this.props.form.validateFields(async (err,values)=>{
            
            if (err) {
                return;
            }

            global.WebApp.loading.show()

            let res =  await this.props.signUp({
                ...values,
                type:'email'
            })
            
            global.WebApp.loading.hide();
            if(res.code){
                Store.set(config.store.token,res.data.token);
                Store.set(config.store.userInfo,res.data.userInfo);
                clearInterval(this.clearTimeout);
                message.success(lang.get('注册成功'));
                this.props.history.replace('/');
            }else{
                message.error(lang.get(res.msg));
            }            
        })
    }

    event_getEmailCode(e){
        let form = this.props.form;
        form.validateFields(['email'],async (err)=>{
            if(err){
                return;
            }
            this.setState({codeIsDisabled:true})
            let email =  form.getFieldValue('email')
            let res = await this.props.getCode({
                type:'email',
                email:email
            });
    
            if(res.code===1){
                message.success(lang.get('验证码发送成功'),2);

                this.setState({
                    getCodeText:60,
                })
                this.clearTimeout = setInterval(function(){
                    if(this.state.getCodeText-1 < 0){
                        clearInterval(this.clearTimeout);
                        this.setState({
                            getCodeText:this.codeText,
                            codeIsDisabled:false,
                        })
                    }else{
                        this.setState({
                            getCodeText:this.state.getCodeText-1,
                        })
                    }
                }.bind(this),1000)

            }else{
                message.error(lang.get(res.msg),2);
                this.setState({codeIsDisabled:false})
            }
        })
    }

    openInNewTab(url) {
        var win = window.open(url, '_blank');
        win.focus();  
    }

    render(){
        return  (
            <Form style={{width:'500px',margin:"0 auto"}} className="c_form"  onSubmit={this.event_submit.bind(this)} >
                <Form.Item
                    {...formItemLayout}
                    label={<span>{(lang.get('登录账号'))}</span>}
                    colon={false}
                >
                    {this.props.form.getFieldDecorator('email',
                        {rules:[{validator:this.validator_email.bind(this)}]}
                    )(<Input size="large" maxLength={30}  placeholder={lang.get('邮箱')} />)}
                    
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label={<span>{lang.get('邮箱验证码')}</span>}
                    colon={false}
                >
                    <Col span={16}>
                        {this.props.form.getFieldDecorator('emailCode',{
                            rules:[{validator:this.validator_emailCode.bind(this)}]
                        })(
                            <Input size="large" maxLength={6} placeholder={lang.get('邮箱验证码')} />
                        )}
                    </Col>
                    <Col span={8}>
                        <Button disabled={this.state.codeIsDisabled} onClick={this.event_getEmailCode.bind(this)}  size="large" style={{width:"116px",marginLeft:"10px","padding":"0 10px"}} >{this.state.getCodeText}</Button>
                    </Col>
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label={<span>{lang.get('登录密码')}</span>}
                    colon={false}
                >                 
                    {this.props.form.getFieldDecorator('loginPass',{
                        rules:[{validator:this.validator_loginPass.bind(this)}]
                    })(
                        <Input type="password" size="large" maxLength={30} placeholder={lang.get('登录密码')}  />
                    )}
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label={<span>{lang.get('确认密码')}</span>}
                    colon={false}
                >
                    {this.props.form.getFieldDecorator('repass',{
                        rules:[{validator: this.validator_repass.bind(this)}]
                    })(
                        <Input type="password" size="large" maxLength={30} placeholder={lang.get('确认密码')}  />
                    )}
                   
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label={<span>{lang.get('验证码')}</span>}
                    colon={false}   
                >
                    <Col span={16}>
                        {this.props.form.getFieldDecorator('imgCode',{
                            rules:[{validator:this.validator_imgCode.bind(this)}]
                        })(
                            <Input size="large" maxLength={6} placeholder={lang.get('验证码')} />
                        )}
                       
                    </Col>
                    <Col span={8}>
                        <div  className="imgCode"><img onClick={this.event_refreshCode.bind(this)} src={this.state.imgUrl} alt="" /></div>
                    </Col>
                </Form.Item>

                {/* <Form.Item
                    {...formItemLayout}
                    label={<span>{lang.get('推荐编码')}</span>}
                    colon={false}
                >   
                    {this.props.form.getFieldDecorator('referralCode',{
                        rules:[{validator:this.validator_referralCode.bind(this)}],
                    })(
                        <Input size="large" maxLength={10} placeholder={lang.get('推荐编码')} />
                    )}
                </Form.Item> */}
                
                <div className="user_agreement">
                    <i  onClick={this.event_agreement.bind(this)} className={this.state.agreement ? 'icon_checkbox_checked' : 'icon_checkbox'}  ></i>
                    <span>{lang.get('我已阅读并同意')}</span>
                    <span className="active_text" onClick={this.openInNewTab.bind(this,'/#/doc/article/3')}>{lang.get('《用户协议》')}</span>
                </div>

                <button disabled={!this.state.agreement}  className="submit" type="submit" >{lang.get('立即注册')}</button>
                <div className="psa"><span></span></div>

            </Form>
        )
    }
    componentWillUnmount(){
        clearInterval(this.clearTimeout);
    }
}

export default Form.create()(MailBox);