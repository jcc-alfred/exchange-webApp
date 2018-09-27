import React from 'react';
import {Link} from 'react-router-dom';
import lang from '../../Lang';

export default class Footer extends React.Component{
    render(){
        return (
        <div className="footer">
            <div className="footer_border">
                <div className="footer_box">
                    <div className="footer_top">
                        <div className="top_left">
                            <Link className="link" to="/doc/article/1"><span>{lang.get('关于我们')}</span></Link>
                            <Link className="link" to="/doc/article/5"><span>{lang.get('费率标准')}</span></Link>
                            <Link className="link" to="/doc/article/3"><span>{lang.get('用户协议')}</span></Link>
                            <Link className="link" to="/doc/article/4"><span>{lang.get('免费声明')}</span></Link>
                            <Link className="link" to="/doc/article/2"><span>{lang.get('联系我们')}</span></Link>
                        </div>
                        <div className="top_right">
                            <div className="right_imgs">
                                <a><i className="icon_social icon_twitter"></i></a>
                                <a><i className="icon_social icon_telegram"></i></a>
                                <a><i className="icon_social icon_qq"></i></a>
                                <a><i className="icon_social icon_wechat"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="copyright">
                <div className="container">
                    <div className="fl">
                        <span>Copyright &copy; 2018 GETDAX.COM All Rights Reserved.</span>
                    </div>
                </div>
            </div>
        </div>
    )}
}