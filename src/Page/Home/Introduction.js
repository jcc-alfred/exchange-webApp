import React from 'react';
import lang from '../../Lang';

export default class Introduction extends React.Component{
    render(){
        return  <div className="introduction">
            <div className="introduction_box">
                <div className="item">
                    <div className="content">
                        <i className="icon_introduction icon_cluster"></i>
                        <div className="item_title">{lang.get('分布式架构')}</div>
                        <div className="item_detail">{lang.get('分布式服务器集群，高性能技术架构')}</div>
                    </div>
                </div>
                <div className="item">
                    <div className="content">
                    <i className="icon_introduction icon_fast"></i>
                    <div className="item_title">{lang.get('交易便捷')}</div>
                    <div className="item_detail">{lang.get('充值提现迅速，高性能撮合引擎，交易方便快捷')}</div>
                    </div>
                </div>
                <div className="item">
                    <div className="content">
                    <i className="icon_introduction icon_security"></i>
                    <div className="item_title">{lang.get('资产安全')}</div>
                    <div className="item_detail">{lang.get('钱包多层加密，动态身份验证，多重风险控制策略')}</div>
                    </div>
                </div>
                <div className="item">
                    <div className="content">
                    <i className="icon_introduction icon_global"></i>
                    <div className="item_title">{lang.get('全球资源')}</div>
                    <div className="item_detail">{lang.get('优秀的国际化团队，服务全球用户')}</div>
                    </div>
                </div>
            </div>
        </div>
    }
}