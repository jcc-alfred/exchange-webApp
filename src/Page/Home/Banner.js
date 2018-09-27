import React from 'react';
import lang from '../../Lang';

export default class Banner extends React.Component{
    render(){
        return  <div className="banner">
            <div className="box">
                <div className="text">
                    <div className="title">
                        <span>{lang.get('全民社区共治，收入返还用户')}</span>
                    </div>
                    <div className="desc">
                        <span>{lang.get('GETDAX是全民社区共治的数字资产交易平台，会将平台80%的收入定期分配给社区用户。')}</span>
                    </div>
                </div>
                {/* <div className="show_imgs">
                    <img src={require('../../assets/img/show_img1.png')} alt="" />
                    <img src={require('../../assets/img/show_img2.png')} alt="" />
                    <img src={require('../../assets/img/show_img3.png')} alt="" />
                    <img src={require('../../assets/img/show_img4.png')} alt="" />
                </div> */}
            </div>
        </div>
    }
}