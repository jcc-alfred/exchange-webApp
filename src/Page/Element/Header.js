import React from 'react';
import {message} from 'antd';
import {Link} from 'react-router-dom';
import lang from '../../Lang';
import {Http, Store , config } from '../../Base'

export default class Header extends React.Component{

    constructor(props){
        super(props);

        let token = Store.get(config.store.token)

        this.state = {
            nations: lang.nations,
            current: lang.langName,
            isShowNations:false,
            active:0,
            isLogin:token
        }
        this.option = [
            {name:'首页',path:'/'},
            {name:'币币交易',path:'/exchange'},
            {name:'专业交易',path:'/market'},
            {name:'资产管理',path:'/assets'},
        ];
        

    }
    
    set_active(index){
        this.setState({active:index});
    }

    async event_logout(){
        Http.post(config.api.logout);
        Store.clear();
        message.success(lang.get('注销成功'));
    }

    event_showNations(e){
        this.setState({
            isShowNations:true
        })
    }
    event_hideNations(e){
        this.setState({
            isShowNations:false
        })
    }
    event_selectLangage(nation){
        lang.setLanguage(nation);
        this.setState({current:nation,isShowNations:false})
    }
    render(){
        let token = Store.get(config.store.token)
        let userInfo = Store.get(config.store.userInfo);
        return (
        <div className="header">
            <div className="header_box">
                <div className="header_left">
                    <img className="logo" src={require('../../assets/img/logo.png')} alt=""/>
                </div>
                <div className="header_content">
                    {this.option.map((item,key)=>{
                        return  <div  key={key} className={this.state.active===key ? 'content_box' : 'content_box' }>
                            <div className={this.state.active===key ? 'lineDiv' : 'lineDiv'}>
                                {
                                    item.path === '/market' ? <a href={`javascript:window.location.href='/#${item.path}';window.location.reload(true)`}><span>{lang.get(item.name)}</span></a> :
                                    <Link to={item.path}><span>{lang.get(item.name)}</span></Link>
                                }
                                
                            </div>
                        </div>
                    })}
                </div>
                <div className="header_right">
                    {!token && <div className="login">
                        <div className="login_content_box">
                            <Link className="link" to="/Login"><span>{lang.get('登录')}</span></Link>
                        </div>
                        <div className="login_content_box">
                            <Link className="link" to="/SignUp"><span>{lang.get('注册')}</span></Link>
                        </div>
                    </div>}
                    {token && <div className="person">
                    <div className="login_content_box">
                            <Link className="link" to="/account"><span>{lang.get('个人中心') + '(UID:' + userInfo.user_id + ')'}</span></Link>
                        </div>
                        <div className="login_content_box">
                            <Link className="link" to="/" onClick={this.event_logout.bind(this)}><span>{lang.get('注销')}</span></Link>
                        </div>
                    </div>}
                    <div className="split">
                        <span>|</span>
                    </div>
                    <div className="lanuage" onMouseOver={this.event_showNations.bind(this)} onMouseOut={this.event_hideNations.bind(this)}>
                    
                        <div className="national_flag" >
                            <img src={require(`../../assets/img/icon/flag/icon_${this.state.current}.png`)} alt=""/>
                            <ul className="nation_list" style={{display:this.state.isShowNations ? 'block' : 'none'}} >
                                {this.state.nations.map((nation,key)=>{
                                    return <li key={key} ><a onClick={this.event_selectLangage.bind(this,nation)} >
                                        <img src={require(`../../assets/img/icon/flag/icon_${nation}.png`)}  alt="" /></a>
                                    </li>
                                })}
                            </ul>
                        </div>

                        <i className="icon_arrow_down" style={{marginTop: '30px',marginLeft: '10px'}} ></i>
                    </div>
                </div>
            </div>
        </div>
        )
    }
}

