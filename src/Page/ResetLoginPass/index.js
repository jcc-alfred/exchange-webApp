import React from 'react';
import { Button ,Form, Col ,Input, message ,Select } from 'antd';
import { Http,config ,Store ,Utils } from '../../Base';
import lang from './../../Lang';
import '../../assets/Less/login.less'

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
            accountType:'email',
            getCodeText:lang.get('获取验证码'),
            codeIsDisabled:false,
            areaList:[],
            areaCode:'+86',
            imgUrl:config.api.imgCode + '?v='+Math.random()
        }
    }
    
    async componentDidMount(){
        let areaList = await import(/* webpackChunkName: "Base/area_code" */ '../../Base/area_code');
        this.setState({areaList:areaList.default});
    }

    validator_username(rule,value,callback){

        if(Utils.isInt(value)){
            this.setState({accountType:'phone'})
        }else{
            this.setState({accountType:'email'})
        }

        if(!value){
            callback(lang.get('请输入登录账号'));
        }
        else if(value && (Utils.isEmail(value) || Utils.isPhone(null,value)) && value.length>4){
            callback();
        }
        else{
            callback(lang.get('登录账号格式错误'));
        }
    }

    validator_code(rule,value,callback){
        if(!value){
            callback(this.state.accountType==="email" ? lang.get('请输入邮箱验证码') : lang.get('请输入手机验证码'));
        }
        else if(value && Utils.isInt(value) && value.length===6 ){
            callback();
        }else{
            callback( this.state.accountType==="email" ? lang.get('邮箱验证错误') : lang.get('手机验证错误'));
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

    async event_getCode(){
        
        this.props.form.validateFields(['username'],async (err)=>{
            
            if(err){
                return;
            }

            let params = {};
            if(this.state.accountType === 'email'){
                params = {
                    type:'email',
                    email:this.props.form.getFieldValue('username'),
                }
            }else{
                params = {
                    type:'phone',
                    areaCode:this.state.areaCode.replace('+',''),
                    phoneNumber:this.props.form.getFieldValue('username'),
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
                message.error(lang.get(res.msg),2);
                this.setState({codeIsDisabled:false})
            }
        })

    }

    async event_submit(e){
        e.preventDefault();

        this.props.form.validateFields(async (err,values)=>{
            if (err) {
                return;
            }
            let params = {
                imgCode:values.imgCode,
                loginPass:values.loginPass,
            }

            if(this.state.accountType==="email"){
                params.accountType = 'email'
                params.emailCode = values.code
                params.email = values.username
            }else{
                params.accountType = 'phone'
                params.phoneCode = values.code
                params.phoneNumber = values.username
            }

            global.WebApp.loading.show()
            let res = await Http.post(config.api.forgotLoginPass,params)
            global.WebApp.loading.hide();
            if(res.code){
                clearInterval(this.clearTimeout);
                message.success(lang.get(res.msg));
                this.props.history.replace('/login');
            }else{
                message.error(lang.get(res.msg))
            }            
        })
    }

    event_refreshCode(){
        this.setState({imgUrl:config.api.imgCode + '?v='+Math.random()});
    }

    render(){return  (
        <div className="loginWap">
            <div className="container">
                <div className="loginDiv_box">
                    <div className="numTitle"><span>{lang.get('忘记密码')}</span></div>
                    <Form style={{width:'500px',margin:"0 auto",marginTop:"20px"}} className="c_form"  onSubmit={this.event_submit.bind(this)} >

                        <Form.Item
                            {...formItemLayout}
                            label={<span>{lang.get('登录账号')}</span>}
                            colon={false}
                        >
                            <Input.Group compact>
                                {this.props.form.getFieldDecorator('username',{rules:[{validator:this.validator_username.bind(this)}]})( 
                                    <Input size="large" style={{ width:this.state.accountType==='phone' ? '70%' : '100%' }} placeholder={lang.get('登录账号')} />
                                )}
                                {this.state.accountType==='phone' && <Select
                                    value={this.state.areaCode}
                                    showSearch dropdownMatchSelectWidth={false} 
                                    dropdownStyle={{width:'331px'}} 
                                    size="large" 
                                    style={{ width: '30%',borderColor:'#40a9ff' }}
                                    defaultActiveFirstOption={false}
                                    onSelect={(val,key)=>{
                                        let [code] = val.split('-')
                                        this.setState({areaCode:'+'+code});
                                    }}
                                >
                                    {this.state.areaList.map((area,key)=>{
                                        return <Select.Option key={key} value={area.code+'-'+area.name} >{'+'+area.code+' '+area.name}</Select.Option>
                                    })}
                                </Select>}
                            </Input.Group>
                        </Form.Item>

                        <Form.Item
                            {...formItemLayout}
                            label={<span>{this.state.accountType==='email' ? lang.get('邮箱验证码') : lang.get('手机验证码')}</span>}
                            colon={false}
                        >
                            <Col span={16}>
                                {this.props.form.getFieldDecorator('code',{
                                    rules:[{validator:this.validator_code.bind(this)}]
                                })(
                                    <Input size="large" style={{width:"100%"}} maxLength={6} placeholder={this.state.accountType==='email' ? lang.get('邮箱验证码') : lang.get('手机验证码')} />
                                )}
                            </Col>
                            <Col span={8}>
                                <Button disabled={this.state.codeIsDisabled} onClick={this.event_getCode.bind(this)}  size="large" style={{width:"93%",marginLeft:"10px","padding":"0 10px"}} >{this.state.getCodeText}</Button>
                            </Col>
                        </Form.Item>
                        
                        <Form.Item
                            {...formItemLayout}
                            label={<span>{lang.get('重置密码')}</span>}
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

                        <button style={{marginTop:"0px"}} className="submit" type="submit" >{lang.get('重置密码')}</button>
                    </Form>
                </div>
            </div>
        </div>
    )}
}

export default Form.create()(ResetLoginPass);