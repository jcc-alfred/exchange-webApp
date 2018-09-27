
import React from 'react';
import {message, Form ,Input ,Button,Col} from 'antd';
import lang from '../../../Lang'
import {Http,config,Store,Utils} from '../../../Base'

const formItemLayout = {
    labelCol: {
        sm: { span: 8 },
    },
    wrapperCol: {
        sm: { span: 10 },
    },
};

class SetLoginPass extends React.Component{

    constructor(props){
        super(props);
        this.codeText = lang.get('获取验证码')
        this.state = {
            userInfo:Store.get(config.store.userInfo),
            codeIsDisabled:false,
            getCodeText:this.codeText
        }
        this.codeType = Utils.getSendCodeType(this.state.userInfo);
    }

    validator_pass(rule,value,callback){
        if(!value){
            callback(lang.get('请输入登录密码'));
        }
        else if(value && Utils.getPassLevel(value)){
            callback();
        }else{
            callback(lang.get('登录密码格式错误'));
        }
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

    validator_repass(rule,value,callback){
        if(!value){
            callback(lang.get('请再次输入登录密码'));
        }
        else if(value && value === this.props.form.getFieldValue('newLoginPass')){
            callback();
        }else{
            callback(lang.get('两次密码输入不一致'));
        }
    }

    async componentDidMount(){
        
    }
    
    async event_getCode(e){
       
        this.setState({codeIsDisabled:true})
        let info = this.state.userInfo;
        let params = {};
        console.log(this.codeType)
        if(this.codeType === 'email'){
            params.type = "email";
            params.email = info.email;
        }else{
            params.type = "phone";
            params.areaCode = info.area_code;
            params.phoneNumber = info.phone_number;
        }

        let res =  await Http.post(config.api.sendCode,params);
        
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
    }

    async event_submit(e){

        e.preventDefault();

        this.props.form.validateFields(async (err,values)=>{
            if (err) {
                return;
            }
            let info = this.state.userInfo;
            global.WebApp.loading.show()

            let params = {};

            params.loginPass = values.loginPass;
            params.newLoginPass = values.newLoginPass;
            
            if(this.codeType === "email"){
                params.emailCode = values.code;
            }else{
                params.phoneCode = values.code;
            }

            if(info.google_secret){
                params.googleCode = values.google;
            }

            let res =  await Http.post(config.api.modifyLoginPass,params)
            
            global.WebApp.loading.hide();
            if(res.code){
                clearInterval(this.clearTimeout);
                message.success(lang.get('修改成功'));
                this.props.history.goBack()
            }else{
                message.error(lang.get(res.msg));
            }            
        })

    }

    render(){
        return <div className="box_right">

                <div className="box_right_box">
                <div className="header_title">
                    <div className="line_div">
                        <div className="slider_fang"></div>
                        <div className="up_text"><span>{lang.get('修改登录密码')}</span></div>
                    </div>
                </div>
                <div className="right_form">

                    <Form className="m_form" onSubmit={this.event_submit.bind(this)}>
                        <Form.Item
                            {...formItemLayout}
                            label={<span>{lang.get('原密码')}</span>}
                            colon={false}
                        >
                            {this.props.form.getFieldDecorator('loginPass',
                                {rules:[{validator:this.validator_pass.bind(this)}]}
                            )(<Input  type="password" size="large" maxLength={30}  placeholder={lang.get('原密码')} />)}
                            
                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            label={<span>{lang.get('新密码')}</span>}
                            colon={false}
                        >
                            {this.props.form.getFieldDecorator('newLoginPass',
                                {rules:[{validator:this.validator_pass.bind(this)}]}
                            )(<Input  type="password" size="large" maxLength={30}  placeholder={lang.get('新密码')} />)}
                            
                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            label={<span>{lang.get('确认密码')}</span>}
                            colon={false}
                        >
                            {this.props.form.getFieldDecorator('reNewLoginPass',
                                {rules:[{validator:this.validator_repass.bind(this)}]}
                            )(<Input  type="password" size="large" maxLength={30}  placeholder={lang.get('确认密码')} />)}
                            
                        </Form.Item>
                        
                        <Form.Item
                            {...formItemLayout}
                            label={<span>{this.codeType==='email' ? lang.get('邮箱验证码') : lang.get('手机验证码')}</span>}
                            colon={false}
                        >
                            <Col span={16}>
                                {this.props.form.getFieldDecorator('code',{
                                    rules:[{validator:this.validator_code.bind(this)}]
                                })(
                                    <Input size="large" style={{width:"100%"}} maxLength={6} placeholder={this.codeType==='email' ? lang.get('邮箱验证码') : lang.get('手机验证码')} />
                                )}
                            </Col>
                            <Col span={8}>
                                <Button disabled={this.state.codeIsDisabled} onClick={this.event_getCode.bind(this)}  size="large" style={{width:"93%",marginLeft:"10px","padding":"0 10px"}} >{this.state.getCodeText}</Button>
                            </Col>
                        </Form.Item>

                        { !!this.state.userInfo.google_secret && <Form.Item
                            {...formItemLayout}
                            label={<span>{lang.get('Google 验证码')}</span>}
                            colon={false}
                        >
                            {this.props.form.getFieldDecorator('google',
                                {rules:[{validator:this.validator_code.bind(this)}]}
                            )(<Input size="large" maxLength={30}  placeholder={lang.get('Google 验证码')} />)}
                            
                        </Form.Item> }
                        
                        <Form.Item
                            {...formItemLayout}
                            label={<span></span>}
                            colon={false}
                            style={{textAlign:'center'}}
                        >

                            <Button size="large" type="primary" htmlType="submit"   style={{width:"100%",color:'#fff'}} >{lang.get('确认')}</Button>
                            
                        </Form.Item>

                    </Form>

                </div>
                </div>
            </div>
    }
    
    componentWillUnmount(){
        clearInterval(this.clearTimeout);
    }
}

export default Form.create()(SetLoginPass);