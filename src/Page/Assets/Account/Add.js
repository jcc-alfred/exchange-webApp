import React from 'react';
import { Http, config ,Store ,Utils} from '../../../Base'
import {message,Button,Modal,Form,Input,Col} from 'antd'
import lang from '../../../Lang'

const formItemLayout = {
    labelCol: {
        sm: { span: 6 },
    },
    wrapperCol: {
        sm: { span: 18 },
    },
};

class Add extends React.Component {
    constructor(props){
        super(props);
        this.userInfo = Store.get(config.store.userInfo);
        this.codeType = Utils.getSendCodeType(this.userInfo);
        this.state = {
            visible:false,
            oldIsDisabled:false,
            oldCodeText:lang.get('获取验证码'),
        }
    }

    validator_safePass(rule,value,callback){
        if(!value){
            callback(lang.get('请输入登录密码'));
        }
        else if(value && Utils.getPassLevel(value)){
            callback();
        }else{
            callback(lang.get('资金密码格式错误'));
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

    validator_blockAddress(rule,value,callback){
        if(!value){
            callback(lang.get('请输入地址'));
        }
        else if(value && value.length>20 ){
            callback();
        }else{
            callback(lang.get('地址输入错误'));
        }
    }

    validator_memo(rule,value,callback){
        if(!value){
            callback(lang.get('请输入标签'));
        }else{
            callback();
        }       
    }

    event_submit(e){
        e.preventDefault();

        let form = this.props.form;

        form.validateFields(async (err, values) => {

            if (err) {
                return;
            }

            global.WebApp.loading.show();

            let params = {
                blockAddress:form.getFieldValue('blockAddress'),
                memo:form.getFieldValue('memo'),
                coinId:this.props.coin.coin_id,
                safePass:form.getFieldValue('safePass'),
                googleCode:form.getFieldValue('googleCode'),
            };

            if(this.codeType === "email"){
                params.emailCode = values.code;
            }else{
                params.phoneCode = values.code;
            }

            let res = await Http.post(config.api.addUserWithdrawAccount,params);

            if (res.code!==1) {
                message.error(lang.get(res.msg));
                return 
                
            }

            let account = await Http.post(config.api.getUserWithdrawAccountByCoinId,{
                coinId:this.props.coin.coin_id
            });
           
            if(account.code!==1){
                global.WebApp.loading.hide();
                message.error(lang.get(account.msg));
                return;
            }
    
            global.WebApp.loading.hide();
            this.props.hide();

            this.props.submit(account.data);
            this.props.form.setFieldsValue({safePass:''});
            this.props.form.setFieldsValue({blockAddress:''});
            this.props.form.setFieldsValue({memo:''});
            this.props.form.setFieldsValue({googleCode:''});
            this.props.form.setFieldsValue({code:''});
        })
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
    render(){
        return <Modal
            title={lang.get('添加账户')}
            visible={this.props.visible}
            onCancel={()=>{this.props.hide()}}
            footer={[
                <Button key="back" onClick={()=>{this.props.hide()}} >{lang.get('取消')}</Button>,
                <Button key="submit" type="primary" onClick={this.event_submit.bind(this)} >{lang.get('确认')}</Button>,
            ]}
        >
            <Form className="m_form">

                <Form.Item
                    {...formItemLayout}
                    label={<span>{lang.get('地址')}</span>}
                    colon={false}
                >
                    {this.props.form.getFieldDecorator('blockAddress',
                        {rules:[{validator:this.validator_blockAddress.bind(this)}]}
                    )(<Input size="large" maxLength={30}  placeholder={lang.get('地址')} />)}    
                </Form.Item>
                
                
                <Form.Item
                    {...formItemLayout}
                    label={<span>{lang.get('标签')}</span>}
                    colon={false}
                >
                    {this.props.form.getFieldDecorator('memo',
                        {rules:[{validator:this.validator_memo.bind(this)}]}
                    )(<Input size="large" maxLength={30}  placeholder={lang.get('标签')} />)}    
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label={<span>{lang.get('资金密码')}</span>}
                    colon={false}
                >
                    {this.props.form.getFieldDecorator('safePass',
                        {rules:[{validator:this.validator_safePass.bind(this)}]}
                    )(<Input type="password"  size="large" maxLength={30}  placeholder={lang.get('资金密码')} />)}    
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
                
                {!!this.userInfo.google_secret && <Form.Item
                    {...formItemLayout}
                    label={<span>{lang.get('Google 验证码')}</span>}
                    colon={false}
                >
                    {this.props.form.getFieldDecorator('googleCode',
                        {rules:[{validator:this.validator_code.bind(this)}]}
                    )(<Input size="large" maxLength={30}  placeholder={lang.get('Google 验证码')} />)}
                    
                </Form.Item> }

            </Form>
        </Modal>
    }
}

export default Form.create()(Add);