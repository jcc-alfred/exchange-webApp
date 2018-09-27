import React from 'react';
import { message } from 'antd';
import { Http,config } from '../../Base';
import moment from 'moment';
import lang from './../../Lang';

export default class NewsDetail extends React.Component{

    constructor(props){
        super(props);
        this.params = this.props.match.params;
        this.state = {
            news:{}
        }
    }
    componentDidMount(){
        this.load(this.params.id);
    }
    componentWillReceiveProps(nextProps){
        this.load(nextProps.match.params.id);
    }
    async load(id){
        global.WebApp.loading.show();
        let res = await Http.post(config.api.getNewsModelById,{id:id}); 
        if(res.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(res.msg));
            return;
        }
        this.setState({
            news:res.data.news
        });
        global.WebApp.loading.hide();
    }

    render(){return  (
        <div className="container">
            <div className="news_detail">
                <div className="news_detail_box">
                    <div className="content_div">
                        <div className="content_title">
                            <div className="title_top"><span>{this.state.news ? lang.getLanguage().startsWith('zh') ? this.state.news.news_title : this.state.news.news_title_en : ''}</span></div>
                            <div className="title_footer"><span>{this.state.news ? moment(this.state.news.update_time).local().format('YYYY-MM-DD HH:mm:ss') : ''}</span></div>
                        </div>
                        <div className="text_detail" dangerouslySetInnerHTML = {{ __html:this.state.news ? lang.getLanguage().startsWith('zh') ? this.state.news.news_content : this.state.news.news_content_en : ''}}>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )}
}