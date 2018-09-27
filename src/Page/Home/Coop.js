import React from 'react';
import lang from '../../Lang';

export default class Coop extends React.Component{
    render(){
        return  <div className="coop">
            <div className="coop_box">
                <div className="partner">{lang.get('友情链接')}</div>
                <div className="partners_show">
                    <div className="partner1">
                        <img src={require("../../assets/img/partner1.png")} alt="" />
                    </div>
                    <div>
                        <img src={require("../../assets/img/partner2.png")} alt="" />
                    </div>
                    <div>
                        <img src={require("../../assets/img/partner3.png")} alt="" />
                    </div>
                    <div>
                        <img src={require("../../assets/img/partner4.png")} alt="" />
                    </div>
                    <div className="partner5">
                        <img src={require("../../assets/img/partner5.png")} alt="" />
                    </div>
                </div>
            </div>
        </div>
    }
}