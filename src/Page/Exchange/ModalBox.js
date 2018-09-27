import React from 'react';
import { config,Store,Utils } from '../../Base';
import { Modal, Button ,Form, Input} from 'antd';
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
        this.userInfo = Store.get(config.store.userInfo);
    }

    validator_safePass(rule,value,callback){
        if(!value){
            callback(lang.get('请输入资金密码'));
        }
        else if(value && Utils.getPassLevel(value)){
            callback();
        }else{
            callback(lang.get('资金密码格式错误'));
        }
    }
    event_submit(e){
        e.preventDefault();
        this.props.form.validateFields(async (err,values)=>{
            if (err) {
                return;
            }
            let params = {safePass:values.safePass};
            this.props.submit(params)
        })
       
    }

    render(){
        return (
            <Modal
            title={lang.get('资金密码')}
            visible={this.props.isShowModal}
            onCancel={()=>{this.props.hide()}}
            footer={[
                <Button key="back" onClick={()=>{this.props.hide()}} >{lang.get('取消')}</Button>,
                <Button key="submit" type="primary" onClick={this.event_submit.bind(this)} >{lang.get('确认')}</Button>,
            ]}
            >
            <Form className="m_form">
                <Form.Item
                    key={1}
                    {...formItemLayout}
                    label={<span>{lang.get('资金密码')}</span>}
                    colon={false}
                >
                    {this.props.form.getFieldDecorator('safePass',
                        {rules:[{validator:this.validator_safePass.bind(this)}]}
                    )(<Input type="password"  size="large" maxLength={30}  placeholder={lang.get('资金密码')} />)}    
                </Form.Item>
            </Form>
            </Modal>
        )
    }
}

export default Form.create()(ModalBox);