import React from 'react';
import lang from '../../Lang';

export default class Sidebar extends React.Component{

    constructor(props){
        super(props);
        this.state = { 
            pathname:this.props.location.pathname,
            index:0,
            els:[
                {name:lang.get('资产总览'),icon:'icon_asset_overview',path:'/assets/overview'},
                {name:lang.get('充值管理'),icon:'icon_recharge_manage', path:'/assets/Deposit'},
                {name:lang.get('提现管理'),icon:'icon_withdrawal_manage',path:'/assets/Withdraw'},
                {name:lang.get('资产账户'),icon:'icon_asset_account',path:'/assets/Account'},
                {name:lang.get('财务账单'),icon:'icon_shopping_records',path:'/assets/Bill'},
                {name:lang.get('推广佣金'),icon:'icon_promotion_comm',path:'/assets/Promotion'}
            ]
        };
    }

    componentWillUpdate(nProps,nState){
        if(this.state.pathname.toLowerCase()!==nProps.location.pathname.toLowerCase()){
            this.setState({
                pathname:nProps.location.pathname.toLowerCase()
            })
        }
    }

    event_toPage(path){
        this.props.history.push(path);
        this.setState({
            pathname:path.toLowerCase()
        })
    }

    render(){
       
        return (
            <div className="box_left">
                <div>
                {this.state.els.map((el,key)=>{
                    let isActive = this.state.pathname.toLowerCase().includes(el.path.toLowerCase());
                    return <div key={key} className={isActive ? "navItem active" : "navItem"} onClick={this.event_toPage.bind(this,el.path)} >
                        <div>
                            <i className={isActive ? el.icon+'_active' : el.icon} ></i>
                            <span>{el.name}</span>
                        </div>
                    </div>
                })}
                </div>
            </div>
        );
    }
}