import React from 'react';
import {Link} from 'react-router-dom';
import {message} from 'antd';
import lang from '../../../Lang'
import {Http,config,Store} from '../../../Base'

export default class SafeSetting extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            userInfo:{},
            identity_status:{
                '0':{
                    title:lang.get('未提交身份认证信息'),
                    stateText:lang.get('未认证'),
                    stateClassName:'status_text red',
                    stateIcon:'icon_s_warn',
                    nextText:lang.get('认证'),
                },
                '1':{
                    title:lang.get('您已通过初级认证'),
                    stateText:lang.get('初级认证'),
                    stateClassName:'status_text green',
                    stateIcon:'icon_s_suc',
                    nextText:lang.get('高级认证'),
                },
                '2':{
                    title:lang.get('您已通过初级认证'),
                    stateText:lang.get('审核中'),
                    stateClassName:'status_text green',
                    stateIcon:'icon_s_suc',
                    nextText:'',
                },
                '3':{
                    title:lang.get('您已通过高级认证'),
                    stateText:lang.get('高级认证'),
                    stateClassName:'status_text green',
                    stateIcon:'icon_s_suc',
                    nextText:'',
                },
                '4':{
                    title:lang.get('您已通过初级认证'),
                    stateText:lang.get('认证失败'),
                    stateClassName:'status_text red',
                    stateIcon:'icon_s_warn',
                    nextText:lang.get('高级认证'),
                }
            }
        }
    }

    componentDidMount(){
        this.load();
    }

    async load(){

        global.WebApp.loading.show();
        
        let res = await Http.post(config.api.userInfo);
        
        global.WebApp.loading.hide();

        if(res.code===1){
            Store.set(config.store.userInfo,res.data)
            this.setState({
                userInfo:res.data
            })
        }else{
            message.error(lang.get(res.msg))
        }
    }


    render(){
        let info = this.state.userInfo;
        let identity_info = this.state.identity_status[info.identity_status] || {};

        return (
            <div className="box_right">
                <div className="safe_setting_box">
                    
                    <div className="box_line">
                        <div className="line_left">
                            <div className="icon">
                                <i className="icon_body_active"></i>
                            </div>
                            <div className="title">
                                <span>{lang.get('身份认证')}</span>
                            </div>
                        </div>
                        <div className="line_center">
                            <span className="blue">{identity_info.title}</span>
                        </div>
                        <div className="line_right">
                            <div className="on_status">
                                <div className="status_icon">
                                    <i className={identity_info.stateIcon}></i>
                                </div>
                                <div className={identity_info.stateClassName}><span>{lang.get(identity_info.stateText)}</span></div>
                            </div>
                            <div className="onOrOffBtn"><Link to='/account/safeSetting/safeKYC'><span>{lang.get(identity_info.nextText)}</span></Link></div>
                        </div>
                    </div>
                    
                    <div className="box_line active">
                        <div className="line_left">
                            <div className="icon">
                                <i className="icon_phone_active"></i>
                            </div>
                            <div className="title">
                                <span>{lang.get('手机验证')}</span>
                            </div>
                        </div>
                        <div className="line_center">
                            <span>{info.phone_number ? lang.get('您绑定的手机为')+' '+info.phone_number : lang.get('暂未绑定手机')}</span>
                        </div>
                        <div className="line_right">
                            <div className="on_status">
                                <div className="status_icon"><i className={info.phone_number ? 'icon_s_suc' : 'icon_s_error'}></i></div>
                                <div className={info.phone_number ? 'status_text green' : 'status_text red'}><span>{info.phone_number ? lang.get('已绑定') : lang.get('未绑定')}</span></div>
                            </div>
                            <div className="onOrOffBtn"><Link to='/account/safeSetting/PhoneModify'><span>{info.phone_number ? lang.get('修改'):lang.get('绑定')}</span></Link></div>
                        </div>
                    </div>
                    
                    <div className="box_line">
                        <div className="line_left">
                            <div className="icon">
                                <i className="icon_email_active"></i>
                            </div>
                            <div className="title">
                                <span>{lang.get('邮箱验证')}</span>
                            </div>
                        </div>
                        <div className="line_center">
                            <span className="blue">{info.email ? lang.get('您绑定的邮箱为')+' '+info.email : lang.get('暂未绑定邮箱')}</span>
                        </div>
                        <div className="line_right">
                            <div className="on_status">
                                <div className="status_icon"><i className={info.email ? 'icon_s_suc' : 'icon_s_error'}></i></div>
                                <div className={info.email ? 'status_text green' : 'status_text red'}><span>{info.email ? lang.get('已绑定') : lang.get('未绑定')}</span></div>
                            </div>
                            <div className="onOrOffBtn"><Link to="/account/safeSetting/EmailModify"><span>{info.email ? lang.get('修改'):lang.get('绑定')}</span></Link></div>
                        </div>
                    </div>
                    
                    <div className="box_line active">
                        <div className="line_left">
                            <div className="icon">
                                <i className="icon_google_active"></i>
                            </div>
                            <div className="title">
                                <span>{lang.get('Google 验证')}</span>
                            </div>
                        </div>
                        <div className="line_center ml">
                            <span>{ info.google_secret ? lang.get('已开启 Google 验证') :  lang.get('为了账户更加安全，建议开启 Google 验证。') }</span>
                        </div>
                        <div className="line_right">
                            <div className="on_status">
                                <div className="status_icon"><i className={info.google_secret ? 'icon_s_suc' : 'icon_s_error'}></i></div>
                                <div className={info.google_secret ? 'status_text green' : 'status_text red'}><span>{info.google_secret ? lang.get('已开启') : lang.get('未开启')}</span></div>
                            </div>
                            <div className="onOrOffBtn"><Link to="/account/safeSetting/GoogleAuth"><span>{info.google_secret ? lang.get('关闭'):lang.get('开启')}</span></Link></div>
                        </div>
                    </div>
                    
                    <div className="box_line">
                        <div className="line_left">
                            <div className="icon">
                                <i className="icon_login_pass_active"></i>
                            </div>
                            <div className="title">
                                <span>{lang.get('登录密码')}</span>
                            </div>
                        </div>
                        <div className="line_center">
                            <span className="blue">{lang.get('登录平台时使用')}</span>
                        </div>
                        <div className="line_right">
                            <div className="on_status">
                                <div className="status_icon"><i className="icon_s_suc"></i></div>
                                <div className="status_text green"><span>{lang.get('已设置')}</span></div>
                            </div>
                            <div className="onOrOffBtn"><Link to="/account/safeSetting/SetLoginPass"><span>{lang.get('修改')}</span></Link></div>
                        </div>
                    </div>
                    
                    <div className="box_line active">
                        <div className="line_left">
                            <div className="icon">
                                <i className="icon_money_pass_active"></i>
                            </div>
                            <div className="title">
                                <span>{lang.get('资金密码')}</span>
                            </div>
                        </div>
                        <div className="line_center">
                            <span>{lang.get('账户资金变动时，需先验证该资金密码')}</span>
                        </div>
                        <div className="line_right">
                            <div className="on_status">
                                <div className="status_icon"><i className={info.is_safe_pass ? 'icon_s_suc' : 'icon_s_error'}></i></div>
                                <div className={info.is_safe_pass ? 'status_text green' : 'status_text red'}><span>{info.is_safe_pass ? lang.get('已设置') : lang.get('未设置')}</span></div>
                            </div>
                            <div className="onOrOffBtn"><Link to="/account/safeSetting/SafePassPage"><span>{info.is_safe_pass ? lang.get('修改'):lang.get('设置')}</span></Link></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}