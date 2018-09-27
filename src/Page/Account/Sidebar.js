import React from 'react';
import lang from '../../Lang'

export default class Sidebar extends React.Component{

    constructor(props){
        super(props);
        this.state = { 
            pathname:this.props.location.pathname,
            index:0,
            els:[
                {name:lang.get('安全设置'),icon:'icon_safe_setting', style:{} ,path:'/account/safeSetting'},
                {name:lang.get('安全策略'),icon:'icon_safe',style:{marginTop:"-3px"}, path:'/account/strategy'},
                {name:lang.get('安全日志'),icon:'icon_log',style:{},path:'/account/safeLogs'},
                {name:lang.get('通知设置'),icon:'icon_notice_setting',style:{marginTop:"1px"},path:'/account/alertSetting'}
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
                {this.state.els.map((el,key)=>{
                    let isActive = this.state.pathname.toLowerCase().includes(el.path.toLowerCase());
                    return <div key={key} className={isActive ? "navItem active" : "navItem"} onClick={this.event_toPage.bind(this,el.path)} >
                        <div>
                            <i style={el.style} className={isActive ? el.icon+'_active' : el.icon} ></i>
                            <span>{el.name}</span>
                        </div>
                    </div>
                })}
            </div>
        );
    }
}