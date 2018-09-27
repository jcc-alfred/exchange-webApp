import React from 'react';
import { Form, Input, Col  } from 'antd';
import { config,Utils } from '../../Base';
import lang from './../../Lang';

const formItemLayout = {
    labelCol: {
        sm: { span: 6 },
    },
    wrapperCol: {
        sm: { span: 18 },
    },
};

class LoginBox extends React.Component{

    constructor(props){
        super(props)
        this.state = {
            imgUrl:config.api.imgCode + '?v='+Math.random()
        }
    }

    validator_username(rule,value,callback){
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
    event_refreshCode(){
        this.setState({imgUrl:config.api.imgCode + '?v='+Math.random()});
    }
    event_submit(e){
        e.preventDefault();

        this.props.form.validateFields(async (err,values)=>{
            if (err) {
                return;
            }
            let params = {};

            if(Utils.isEmail(values.username)){
                params = {
                    accountType:"email",
                    email:values.username,
                    loginPass:values.loginPass,
                    imgCode:values.imgCode
                }
            }else{
                params = {
                    accountType:"phone",
                    phoneNumber:values.username,
                    loginPass:values.loginPass,
                    imgCode:values.imgCode
                }
            }
            
            this.props.submit(params)
        })
    }

    render(){
        return  (
            <Form style={{width:'500px',margin:"0 auto",marginTop:"20px"}} className="c_form"  onSubmit={this.event_submit.bind(this)} >
                <Form.Item
                    {...formItemLayout}
                    label={<span>{lang.get('登录账号')}</span>}
                    colon={false}
                >
                    {this.props.form.getFieldDecorator('username',
                        {rules:[{validator:this.validator_username.bind(this)}]}
                    )(<Input size="large" maxLength={30}  placeholder={lang.get('邮箱/手机号')} />)}
                    
                </Form.Item>
               

                <Form.Item
                    {...formItemLayout}
                    label={<span>{lang.get('登录密码')}</span>}
                    colon={false}
                >                 
                    {this.props.form.getFieldDecorator('loginPass',{
                        rules:[{validator:this.validator_loginPass.bind(this)}]
                    })(
                        <Input  type="password" size="large" maxLength={30} placeholder={lang.get('登录密码')}  />
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
                            <Input  size="large"  maxLength={6} placeholder={lang.get('验证码')} />
                        )}
                       
                    </Col>
                    <Col span={8}>
                        <div className="imgCode"><img onClick={this.event_refreshCode.bind(this)} src={this.state.imgUrl} alt="" /></div>
                    </Col>
                </Form.Item>
                
                <button style={{marginTop:"0px"}} className="submit" type="submit" >{lang.get('立即登录')}</button>
            </Form>
        )
    }
}

export default Form.create()(LoginBox);