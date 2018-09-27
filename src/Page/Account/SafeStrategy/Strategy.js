import React from 'react';
import {message,Modal,Form,Input,Button} from 'antd';
import { Http, config, Store, Utils } from '../../../Base'
import lang from '../../../Lang'

const formItemLayout = {
    labelCol: {
        sm: { span: 6 },
    },
    wrapperCol: {
        sm: { span: 18 },
    },
};

class Strategy extends React.Component {

    constructor(props) {
        super(props)
        this.state = { data:[],visible:false };
        this.icons = ['icon_login_verification','icon_transaction','icon_withdraw'];
        this.userInfo = Store.get(config.store.userInfo);
        this.isBindGoogle = this.userInfo.google_secret;
    }

    async componentDidMount(){
        this.load();
    }
    async load(){
        global.WebApp.loading.show();
        let res = await Http.post(config.api.strategySettings);
        global.WebApp.loading.hide();

        if(res.code===1){
            this.setState({data:res.data});
        }
        else{
            message.error(lang.get(res.msg));
        }
    }

    event_openOption(key){
        document.querySelectorAll('.item_option').forEach(((el)=>{
            if(`option_${key}` !== el.id){
                el.style.display = "none";
            }
        }));
        if(document.querySelector(`#option_${key}`).style.display === 'none'){
            document.querySelector(`#option_${key}`).style.display = "block";
        }else{
            document.querySelector(`#option_${key}`).style.display = "none";
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
            let {key,category,strategy} = this.params;
    
            global.WebApp.loading.show();
            let res = await Http.post(config.api.setUserSafeStrategy,{
                categoryTypeId:category,
                authStrategyTypeId:strategy,
                safePass:this.props.form.getFieldValue('safePass')
            });
            global.WebApp.loading.hide();
    
            if(res.code===1){
                this.load();
                message.success(lang.get('设置成功'));
            }
            else{
                message.error(lang.get(res.msg));
            }
        });
    }
    
    validator_safePass(rule,value,callback){
        if(!value){
            callback(lang.get('请输入登录密码'));
        }
        else if(value && Utils.getPassLevel(value)){
            callback();
        }else{
            callback(lang.get('登录密码格式错误'));
        }
    }

    render() {
        return <div className="box_right">
            <div className="safe_method">
                <div className="right_box_del">

                    {this.state.data.map((item,key)=>{
                        return [
                            <div key={key} className={key%2 ? 'item dark':'item' }>
                                <div className="login_logo_div">
                                    <i className={this.icons[key]}></i>
                                </div>
                                <div className="verify_text"><span>{lang.get(item.category_type_name)}</span></div>
                                <div className="proess_text"><span>{lang.get('通过')}</span></div>
                                <div className="desc_text"><span>{lang.get(item.strategy_name)}</span></div>
                                <div className="change_text">
                                    <div className="change_btn" onClick={this.event_openOption.bind(this,key)}>
                                        <span>{lang.get('更改')}</span>
                                    </div>
                                </div>
                            </div>
                            ,
                            <div id={'option_'+key} key={key+'option'} className="item_option" style={{display:"none"}}>
                                {item.option.map((opt,okey)=>{
                                    return  <div className="row" key={okey} style={{marginTop:okey===0 ? 0: '10px'}} >
                                        <div className="item_sec_son">{lang.get(opt.strategy_name)}</div>
                                            {
                                                [3,4,9,10].includes(opt.user_auth_strategy_type_id) ? 
                                                (this.isBindGoogle ? (item.user_auth_strategy_type_id === opt.user_auth_strategy_type_id ?  <div className="green_right"><i className="icon_success"></i></div> : <div onClick={this.event_showModal.bind(this,{key:key,category:item.category_type_id,strategy:opt.user_auth_strategy_type_id})} className="circle"></div>) : null)
                                                : (item.user_auth_strategy_type_id === opt.user_auth_strategy_type_id ?  <div className="green_right"><i className="icon_success"></i></div> : <div onClick={this.event_showModal.bind(this,{key:key,category:item.category_type_id,strategy:opt.user_auth_strategy_type_id})} className="circle"></div>) 
                                            }
                                    </div>
                                })}
                            </div>
                        ]
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

    async componentWillUnmount(){
       
    }
}

export default Form.create()(Strategy);