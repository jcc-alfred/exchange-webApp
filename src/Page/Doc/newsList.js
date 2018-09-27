import React from 'react';
import { message,Pagination } from 'antd';
import { Http,config } from '../../Base';
import moment from 'moment';
import lang from './../../Lang';

export default class NewsList extends React.Component{

    constructor(props){
        super(props);
        this.params = this.props.match.params;
        this.state = {
            totalCount:0,
            newsList:[],
            typeId:this.params.typeId
        }
    }
    componentDidMount(){
        this.load();
    }
    async load(page=1){
        global.WebApp.loading.show();
        //typeId:1 news 2 announcement
        let res = await Http.post(config.api.getNewsList,{typeId:this.state.typeId,page:page,pageSize:5}); 
        if(res.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(res.msg));
            return;
        }
        this.setState({
            totalCount:res.data.news.rowCount,
            newsList:res.data.news.list
        });
        global.WebApp.loading.hide();
    }
    async onChange(page) {
        this.load(page);
    }
    toPage(url){
        this.props.history.push(url);
    }
    render(){return  (
        <div className="container">
            <div className="newsList">
                <div className="newsList_box">
                    <div className="content_div">
                        <div className="news_title">
                            <div className="title_box_div"><span>{this.state.typeId == 1 ? lang.get('新闻资讯') : lang.get('平台公告')}</span></div>
                        </div>
                        <div className="news_content">
                        {
                            this.state.newsList.map((item,key)=>{
                                return <div className="news_item" key={key}>
                                            <div className="item_title">
                                                <div className="blueSlider"></div>
                                                <div className="title_text" onClick={this.toPage.bind(this,`/doc/newsDetail/${item.page_news_id}`)}><span>{lang.getLanguage().startsWith('zh') ? item.news_title : item.news_title_en}</span></div>
                                            </div>
                                            <div className="item_text"><span>{lang.getLanguage().startsWith('zh') ? item.news_content.substring(0,200) : item.news_content_en.substring(0,200)}</span></div>
                                            <div className="item_date">{moment(item.update_time).local().format('YYYY-MM-DD HH:mm:ss')}</div>
                                        </div>
                            })
                        }                                        
                        </div>
                        <div className="Paging">
                            <Pagination defaultCurrent={1} total={this.state.totalCount} defaultPageSize={5} onChange={this.onChange.bind(this)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )}
}