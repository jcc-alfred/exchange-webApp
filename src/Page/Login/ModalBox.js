import React from 'react';
import { Http,config,Store,Utils } from '../../Base';
import { Modal, Button ,Form, Col ,Input,message } from 'antd';
import lang from './../../Lang';

const formItemLayout = {
    labelCol: {
        sm: { span: 6 },
    },
    wrapperCol: {
        sm: { span: 18 },
    },
};

class ModalBox extends React.Component{

    constructor(props){
        super(props)
        this.codeText = lang.get('获取验证码')
        this.userInfo = Store.get(config.store.userInfo);
        this.state = {
            codeIsDisabled:false,
            getCodeText:this.codeText
        }
    }

    validator_code(rule,value,callback){
        if(!value){
            callback(this.props.accountType==="email" ? lang.get('请输入邮箱验证码') : lang.get('请输入手机验证码'));
        }
        else if(value && Utils.isInt(value) && value.length===6 ){
            callback();
        }else{
            callback( this.props.accountType==="email" ? lang.get('邮箱验证码错误') : lang.get('手机验证码错误'));
        }
    }
    
    validator_google(rule,value,callback){
        if(!value){
            callback(lang.get('请输入Google验证码'));
        }
        else if(value && Utils.isInt(value) && value.length===6 ){
            callback();
        }else{
            callback(lang.get('Google验证码错误'));
        }
    }

    async event_getCode({type,email,areaCode,phoneNumber}){

        let userInfo = Store.get(config.store.userInfo);
        let params = {};
        if(this.props.accountType === 'email'){
            params = {
                type:'email',
                email:userInfo.email,
            }
        }else{
            params = {
                type:'phone',
                areaCode:userInfo.area_code,
                phoneNumber:userInfo.phone_number,
            }
        }
        this.setState({codeIsDisabled:true});
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

    event_submit(e){
        e.preventDefault();
        console.log('event_submit')
        this.props.form.validateFields(async (err,values)=>{
            console.log(values);
            if (err) {
                return;
            }
            let params = {};

            if(values.code){
                let key = this.props.accountType === 'email' ? 'emailCode' : 'phoneCode';
                params[key] = values.code;
            }
    
            if(values.google){
                params['googleCode'] = values.google;
            }
            this.props.submit(params)
        })
       
    }

    renderForm(){
        if(this.props.safe===2){
            return <Form.Item
                {...formItemLayout}
                label={<span>{this.props.accountType==="email" ? lang.get('邮箱验证码') : lang.get('手机验证码')}</span>}
                colon={false}
            >
                <Col span={16}>
                    {this.props.form.getFieldDecorator('code',{
                        rules:[{validator:this.validator_code.bind(this)}]
                    })(
                        <Input size="large" maxLength={6} placeholder={this.props.accountType==="email" ? lang.get('邮箱验证码') : lang.get('手机验证码')} />
                    )}
                </Col>
                <Col span={8}>
                    <Button disabled={this.state.codeIsDisabled} onClick={this.event_getCode.bind(this)}  size="large" style={{width:"116px",marginLeft:"10px","padding":"0 10px"}} >{this.state.getCodeText}</Button>
                </Col>
            </Form.Item>
        }
        if(this.props.safe===3){
            return <Form.Item
                {...formItemLayout}

                label={<span>{lang.get('Google 验证码')}</span>}
                colon={false}
            >
                {this.props.form.getFieldDecorator('google',
                    {rules:[{validator:this.validator_google.bind(this)}]}
                )(<Input size="large" maxLength={30}  placeholder={lang.get('Google 验证码')} />)}
                
            </Form.Item>
        }
        if(this.props.safe===4){
            let els = [];
            if(this.props.isOffsite){
                els.push(<Form.Item
                    key={0}
                    {...formItemLayout}
                    label={<span>{this.props.accountType==="email" ? lang.get('邮箱验证码') : lang.get('手机验证码')}</span>}
                    colon={false}
                >
                    <Col span={16}>
                        {this.props.form.getFieldDecorator('code',{
                            rules:[{validator:this.validator_code.bind(this)}]
                        })(
                            <Input size="large" maxLength={6} placeholder={this.props.accountType==="email" ? lang.get('邮箱验证码') : lang.get('手机验证码')} />
                        )}
                    </Col>
                    <Col span={8}>
                        <Button disabled={this.state.codeIsDisabled} onClick={this.event_getCode.bind(this)}  size="large" style={{width:"116px",marginLeft:"10px","padding":"0 10px"}} >{this.state.getCodeText}</Button>
                    </Col>
                </Form.Item>);
            }

            els.push(<Form.Item
                key={1}
                {...formItemLayout}
                label={<span>{lang.get('Google 验证码')}</span>}
                colon={false}
            >
                {this.props.form.getFieldDecorator('google',
                    {rules:[{validator:this.validator_google.bind(this)}]}
                )(<Input size="large" maxLength={30}  placeholder={lang.get('Google 验证码')} />)}    
            </Form.Item>)

            return els;
        }
    }

    render(){
        return  (
            <Modal
                title={lang.get('安全认证')}
                closable={false}
                maskClosable={false}
                visible={this.props.isShowModal}
                footer={<Button onClick={this.event_submit.bind(this)}  size="large" value="OK" type="primary" loading={this.props.confirmLoading}>{lang.get('确认')}</Button>}
            >
                <Form className="m_form">
                    {this.renderForm()}
                </Form>
            </Modal>
        )
    }

    componentWillUnmount(){
        clearInterval(this.clearTimeout);
    }
}

export default Form.create()(ModalBox);