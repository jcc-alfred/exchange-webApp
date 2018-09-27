import React from 'react';
import { Http,config,Store, Utils } from '../../Base';
import MailBox from './MailBox'
import PhoneBox from './PhoneBox';
import lang from './../../Lang';
import '../../assets/Less/login.less'

export default class SignUp extends React.Component{
    
    constructor(props){
        super(props);
        this.params = this.props.match.params;
        let refcode = '';
        let storeRefcode = Store.get(config.store.refCode);
        if(storeRefcode && Utils.isInt(storeRefcode)){
            refcode = storeRefcode;
        }else if(this.params.refcode && Utils.isInt(this.params.refcode)){
            Store.set(config.store.refCode,this.params.refcode);
            refcode = this.params.refcode;
        }
        this.state = {
            username:'',
            loginPass:'',
            reLoginPass:'',
            imgCode:'',
            referralCode:refcode,
            defaultSignUpType:config.sys.defaultSignUp
        };
    }

    getCode({type,email,areaCode,phoneNumber}){
        let data = {};
        if(type==='email'){
            data = {
                type:type,
                email:email
            }
        }else{
            data = {
                type:type,
                areaCode:areaCode,
                phoneNumber:phoneNumber
            }
        }
        return Http.post(config.api.sendCode,data)
    }
    signUp({type,email,areaCode,phoneNumber,loginPass,imgCode,emailCode,phoneCode,referralCode}){
        referralCode = this.state.referralCode;
        let data = {}
        if(type==="email"){
            data = {
                "accountType":type,
                "email":email,
                "loginPass":loginPass,
                "imgCode":imgCode,
                "emailCode":emailCode,
                "referralCode":referralCode
            }
        }
        if(type==='phone'){
            data = {
                "accountType":type,
                "areaCode":areaCode,
                "phoneNumber":phoneNumber,
                "loginPass":loginPass,
                "imgCode":imgCode,
                "phoneCode":phoneCode,
                "referralCode":referralCode
            }
        }
        return Http.post(config.api.signUp,data)
    }

    async componentDidMount(){
        // this.area_code =  await import(/* webpackChunkName: "Base/area_code" */ '../../Base/area_code');
    }

    event_selectSignUpType(e){
        this.state.defaultSignUpType === 'email' ? this.setState({defaultSignUpType:'phone'}) : this.setState({defaultSignUpType:'email'});
    }

    render(){
        return (
            <div className="loginWap">
                <div className="container">
                    <div className="registered">
                        <div className="registered_box">
                            <div className="numTitle"><span>{lang.get('注册帐号')}</span></div>
                            {config.sys.isUsePhoneSignUp && <div className="tabReg" ><a onClick={this.event_selectSignUpType.bind(this)} >{this.state.defaultSignUpType === 'email' ? lang.get('手机注册') : lang.get('邮箱注册')}</a></div>}
                            <div className="clear" ></div>
                            {this.state.defaultSignUpType === 'email' && <MailBox history={this.props.history}  signUp={this.signUp.bind(this)}  getCode={this.getCode.bind(this)}  />}
                            {this.state.defaultSignUpType === 'phone' && <PhoneBox history={this.props.history}  signUp={this.signUp.bind(this)}  getCode={this.getCode.bind(this)} />}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

