import React from 'react';
import { message } from 'antd';
import { Http,config } from '../../Base';
import moment from 'moment';
import lang from './../../Lang';

export default class Article extends React.Component{

    constructor(props){
        super(props);
        this.params = this.props.match.params;
        this.state = {
            article:{}
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
        let res = await Http.post(config.api.getArticleModelById,{id:id}); 
        if(res.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(res.msg));
            return;
        }
        this.setState({
            article:res.data.article
        });
        global.WebApp.loading.hide();
    }

    render(){return  (
        <div className="container">
            <div className="news_detail">
                <div className="news_detail_box">
                    <div className="content_div">
                        <div className="content_title">
                            <div className="title_top" style={{marginBottom:'10px'}}><span>{this.state.article ? lang.getLanguage().startsWith('zh') ? this.state.article.doc_title : this.state.article.doc_title_en : ''}</span></div>
                        </div>
                        <div className="text_detail" dangerouslySetInnerHTML = {{ __html:this.state.article ? lang.getLanguage().startsWith('zh') ? this.state.article.doc_content : this.state.article.doc_content_en : ''}}>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )}
}