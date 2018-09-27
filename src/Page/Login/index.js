import React from 'react';
import { message } from 'antd';
import { Http,config ,Store ,Utils } from '../../Base';
import { Link } from 'react-router-dom';
import lang from './../../Lang';
import LoginBox from './LoginBox'
import ModalBox from './ModalBox'
import '../../assets/Less/login.less'

export default class SignUp extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            isShowModal:false,
            confirmLoading:false,
            safe:0,
            accountType:null
        }
    }

    async authSafety(params){
        this.setState({confirmLoading:true})

        global.WebApp.loading.show();
        let res = await Http.post(config.api.authSafety,params);
        global.WebApp.loading.hide();

        this.setState({confirmLoading:false})

        if(res.code===1){
            Store.set(config.store.token,res.data.token);
            message.success(lang.get(lang.get('登录成功')),2);
            this.props.history.replace('/');
        }else{
            message.error(lang.get(res.msg),2);
        }
    }

    async login(params){
        global.WebApp.loading.show()
        let res = await Http.post(config.api.login,params);
        global.WebApp.loading.hide();
        if(res.code===1){
            

            Store.set(config.store.token,res.data.token);
            Store.set(config.store.userInfo,res.data.userInfo);

            if(res.data.safe){
                this.setState({
                    isShowModal:true,
                    safe:res.data.safe,
                    isOffsite : res.data.is_offsite,
                    accountType:Utils.getSendCodeType(res.data.userInfo)
                });
            }else{
                message.success(lang.get('登录成功'));
                this.props.history.replace('/');
            }

        }else{
            message.error(lang.get(res.msg))
        }
    }

    render(){return  (
        <div className="loginWap">
            <div className="container">
                <div className="loginDiv_box">
                    <div className="numTitle"><span>{lang.get('用户登录')}</span></div>
                    <LoginBox history={this.props.history} submit={this.login.bind(this)} />
                    <div className="btns">
                        <div className="forgetPass"><Link to="/ResetPass" ><span>{lang.get('忘记密码')+'?'}</span></Link></div>
                        <div className="freeRegistered"><Link to="/SignUp" ><span>{lang.get('立即注册')}</span></Link></div>
                    </div>
                </div>
                <ModalBox accountType={this.state.accountType} isOffsite={this.state.isOffsite} safe={this.state.safe} isShowModal={this.state.isShowModal} confirmLoading={this.state.confirmLoading} submit={this.authSafety.bind(this)} />
            </div>
        </div>
    )}
}