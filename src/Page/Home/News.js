import React from 'react';
import {message} from 'antd';
import {Http, config } from '../../Base';
import moment from 'moment'
import lang from '../../Lang';

export default class News extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            newsList:[],
            announcementList:[]
        }
    }
    componentDidMount(){
        this.load();
    }
    async load(){
        let res = await Http.post(config.api.getHomeNewsList); 
        if(res.code!==1){
            message.error(lang.get(res.msg));
            return;
        }
        this.setState({
            newsList:res.data.news.list,
            announcementList:res.data.announcement.list
        });
    }
    event_toPage(url){
        this.props.toPage(url);
    }
    render(){
        return  <div className="news">
            <div className="news_box">
                <div className="news_left">
                    <div className="news_header">
                        <div className="news_title">
                            <span>{lang.get('新闻资讯')}</span>
                        </div>
                        <div className="new_more" onClick={this.event_toPage.bind(this,`/doc/newsList/1`)}>
                            <span>{lang.get('更多')}</span>
                        </div>
                    </div>
                    {
                        this.state.newsList.map((item,key)=>{
                            return <div className="news_items" key={key}>
                                        <div className="news_items_up">
                                            <div className="gray_ball"></div>
                                            <div className="items_detail" onClick={this.event_toPage.bind(this,`/doc/newsDetail/${item.page_news_id}`)}>
                                                <span>{lang.getLanguage().startsWith('zh') ? item.news_title : item.news_title_en}</span>
                                            </div>
                                        </div>
                                        <div className="news_items_down">
                                            <span>{moment(item.update_time).local().format('YYYY-MM-DD HH:mm:ss')}</span>
                                        </div>
                                    </div>
                        })
                    }
                </div>
                <div className="news_right">
                    <div className="news_header">
                        <div className="news_title">
                            <span>{lang.get('平台公告')}</span>
                        </div>
                        <div className="new_more" onClick={this.event_toPage.bind(this,`/doc/newsList/2`)}>
                            <span>{lang.get('更多')}</span>
                        </div>
                    </div>
                    {
                        this.state.announcementList.map((item,key)=>{
                            return <div className="news_items" key={key}>
                                        <div className="news_items_up">
                                            <div className="gray_ball"></div>
                                            <div className="items_detail" onClick={this.event_toPage.bind(this,`/doc/newsDetail/${item.page_news_id}`)}>
                                                <span>{lang.getLanguage().startsWith('zh') ? item.news_title : item.news_title_en}</span>
                                            </div>
                                        </div>
                                        <div className="news_items_down">
                                            <span>{moment(item.update_time).local().format('YYYY-MM-DD HH:mm:ss')}</span>
                                        </div>
                                    </div>
                        })
                    }
                </div>
                <div style={{clear:"both"}}></div>
            </div>
        </div>
    }
}