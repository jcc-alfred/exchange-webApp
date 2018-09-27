import React from 'react';
import { Http, config, Utils } from '../../../Base'
import { message,Modal,Form,Button,Input } from 'antd'
import lang from '../../../Lang'

const formItemLayout = {
    labelCol: {
        sm: { span: 6 },
    },
    wrapperCol: {
        sm: { span: 18 },
    },
};

class AlertSetting extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            data:[],
            visible:false,
        };
        this.icons = ['icon_login_warn','icon_gps','icon_setting','icon_push_money','icon_withdraw'];
    }

    componentDidMount(){
        this.load();
    }

    async load(){
        global.WebApp.loading.show();
        let res = await Http.post(config.api.getUserAlertSettings);
        global.WebApp.loading.hide();

        if(res.code===1){
            this.setState({data:res.data});
        }
        else{
            message.error(lang.get(res.msg));
        }
    }

    async event_showModal(params){
        this.params = params;
        this.props.form.setFieldsValue({safePass:''})
        this.setState({visible:true})
    }
    async event_hideModal(){
        this.setState({visible:false})
    }
    async event_changeStrategy(){
        this.props.form.validateFields(['safePass'],async (err)=>{

            if(err){
                return;
            }

            this.setState({visible:false})
           
            let key = this.params;
            let data = this.state.data[key];
            
            global.WebApp.loading.show();
            let res = await Http.post(config.api.setUserAlert,{
                alertId:data.user_alert_id,
                status:data.user_alert_status ? 0 : 1,
                safePass:this.props.form.getFieldValue('safePass')
            });
            global.WebApp.loading.hide();
    
            // this.state.data[key].user_auth_strategy_type_id = strategy
    
            if(res.code===1){
                this.state.data[key].user_alert_status = data.user_alert_status ? 0 : 1;
                this.setState({
                    data:this.state.data
                })
                message.success(lang.get('设置成功'));
            }
            else{
                message.error(lang.get(res.msg));
            }
        });
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

    render(){
        return  <div className="box_right">
            <div className="inform_setting">
                <div className="right_box_del">
                    {this.state.data.map((item,key)=>{
                        return  <div key={key} className={key%2 ? 'box_del_line active_line' : 'box_del_line'}>
                            <div className="line_left">
                                <div className="imgDiv">
                                    <i className={this.icons[key]}></i>
                                </div>
                                <div className="titleDiv">
                                    <span>{lang.get(item.alert_type_name)}</span>
                                </div>
                            </div>
                            <div className="line_center">
                                <span>{lang.get(item.alert_type_comments)}</span>
                            </div>
                            <div className="line_right">
                                <div className="on_status">
                                    <div className="status_img"><i className={item.user_alert_status ? "icon_s_suc" : "icon_s_error"}></i></div>
                                    <div className={item.user_alert_status ? "status_text greenActive" : "status_text redActive"}><span>{item.user_alert_status ? lang.get('已开启') : lang.get('未开启')}</span></div>
                                </div>
                                <div className="onOrOffBtn"><span onClick={this.event_showModal.bind(this,key)}>{item.user_alert_status ? lang.get('关闭') : lang.get('开启')}</span></div>
                            </div>
                        </div>
                    })}
                </div>
            </div>
            <Modal
                title={lang.get('资金密码')}
                visible={this.state.visible}
                onCancel={this.event_hideModal.bind(this)}
                footer={[
                    <Button key="back" onClick={this.event_hideModal.bind(this)} >{lang.get('取消')}</Button>,
                    <Button key="submit" type="primary" onClick={this.event_changeStrategy.bind(this)} >{lang.get('确认')}</Button>,
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
        </div>
    } 
}

export default Form.create()(AlertSetting);