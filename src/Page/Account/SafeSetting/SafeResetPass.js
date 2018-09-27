import React from 'react';
import { Button ,Form, Col ,Input, message} from 'antd';
import { Http,config ,Store ,Utils } from '../../../Base';
import lang from '../../../Lang';

const formItemLayout = {
    labelCol: {
        sm: { span: 6 },
    },
    wrapperCol: {
        sm: { span: 18 },
    },
};

class ResetLoginPass extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            isShowModal:false,
            confirmLoading:false,
            safe:0,
            accountType:'email',
            getCodeText:lang.get('获取验证码'),
            codeIsDisabled:false,
            areaList:[],
            areaCode:'+86'
        }
        this.userInfo = Store.get(config.store.userInfo);
        this.codeType = Utils.getSendCodeType(this.userInfo);
    }

    async componentDidMount(){
        let areaList = await import(/* webpackChunkName: "Base/area_code" */ '../../../Base/area_code');
        console.log(areaList.default.length);
        this.setState({areaList:areaList.default});
    }

    validator_code(rule,value,callback){
        if(!value){
            callback(this.state.accountType==="email" ? lang.get('请输入邮箱验证码') : lang.get('请输入手机验证码'));
        }
        else if(value && Utils.isInt(value) && value.length===6 ){
            callback();
        }else{
            callback( this.state.accountType==="email" ? lang.get('邮箱验证码格式错误') : lang.get('手机验证码格式错误'));
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

    async event_getCode(){
        
        let params = {};
        if(this.codeType === 'email'){
            params = {
                type:'email',
                email:this.userInfo.email,
            }
        }else{
            params = {
                type:'phone',
                areaCode:this.userInfo.area_code,
                phoneNumber:this.userInfo.phone_number,
            }
        }

        this.setState({codeIsDisabled:true});
        let res =  await Http.post(config.api.sendCode,params);

        if(res.code===1){

            message.success(lang.get('验证码发送成功'),2);

            let timer = 60;

            this.setState({
                getCodeText:timer+'s',
            })

            this.clearTimeout = setInterval(function(){
                if(timer-1 < 0){
                    clearInterval(this.clearTimeout);
                    this.setState({
                        getCodeText:lang.get('获取验证码'),
                        codeIsDisabled:false,
                    })
                }else{
                    timer--;
                    this.setState({
                        getCodeText:timer+'s',
                    })
                }
            }.bind(this),1000)

        }else{
            message.error(lang.get(res.msg));
            this.setState({codeIsDisabled:false})
        }
   
    }

    async event_submit(e){
        e.preventDefault();

        this.props.form.validateFields(async (err,values)=>{
            if (err) {
                return;
            }
            let params = {
                safePass:values.loginPass,
            }

            if(this.codeType==="email"){
                params.emailCode = values.code
            }else{
                params.phoneCode = values.code
            }

            global.WebApp.loading.show()
            let res = await Http.post(config.api.forgotSafePass,params)
            global.WebApp.loading.hide();
            if(res.code){
                clearInterval(this.clearTimeout);
                message.success(lang.get(res.msg));
                this.props.history.goBack()
            }else{
                message.error(lang.get(res.msg))
            }            
        })
    }

    render(){return  (
        <div className="box_right">
            <div className="box_right_box">
                <div className="header_title">
                    <div className="line_div">
                        <div className="slider_fang"></div>
                        <div className="up_text"><span>{lang.get('找回资金密码')}</span></div>
                    </div>
                </div>
                <div className="right_form">
                <Form style={{width:'500px',margin:"0 auto",marginTop:"20px"}} className="m_form"  onSubmit={this.event_submit.bind(this)} >

 
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

                    <Form.Item
                        {...formItemLayout}
                        label={<span>{lang.get('资金密码')}</span>}
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
    )}
}

export default Form.create()(ResetLoginPass);