import React from 'react';
import { Http, config ,Store} from '../../../Base'
import {Table,message} from 'antd'
import lang from '../../../Lang'
import moment from 'moment'

export default class extends React.Component {

    constructor(props){
        super(props);
        this.userInfo = Store.get(config.store.userInfo);
        this.state = {
            statics:[],
            list:[],
            page:1,
            pageSize:10,
            rowCount:0
        }
    }

    async componentDidMount(){
        let [statics,list] = await Promise.all([this.loadStatics(),this.loadList(1,10)]);
        if(statics.code!==1 || list.code!==1){
            message.error(lang.get(statics.msg) || lang.get(list.msg));
            return;
        }
        this.setState({
            statics:statics.data,
            list:list.data.list,
            rowCount:list.data.rowCount
        })

    }
    
    loadStatics(){
        return Http.post(config.api.getUserBonusStatics);
    }
    loadList(page,pageSize){
        return Http.post(config.api.getUserBonusList,{page,pageSize})
    }
    
    columnsStatics(){
        return  [
            {title:lang.get('币种'),dataIndex:'coin_name',align:'center',width:'25%'},
            {title:lang.get('总收入'),dataIndex:'TotalAmount',align:'center',width:'25%'},
            {title:lang.get('日收入'),dataIndex:'DayAmount',align:'center',width:'25%'},
            {title:lang.get('近30天'),dataIndex:'Day30Amount',align:'center',width:'25%'}
        ]
    }

    columnsList(){
        return  [
            {title:lang.get('币种'),dataIndex:'coin_unit',align:'center',width:'15%'},
            {title:lang.get('奖励类型'),dataIndex:'user_bonus_type_name',align:'center',width:'30%',render:(text)=>{return lang.get(text)}},
            {title:lang.get('奖励数量'),dataIndex:'trade_amount',align:'center',width:'30%'},
            {title:lang.get('时间'),dataIndex:'create_time',align:'center',width:'25%',render: (text) => {return <span>{moment(text).local().format('YYYY-MM-DD HH:mm:ss')}</span>}}
        ]
    }
    
    async event_tablesChange(pagination, filters, sorter){

        global.WebApp.loading.show();

        let dlList = await this.loadList(pagination.current , this.state.pageSize);
    
        if(dlList.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(dlList.msg));
            return;
        }

        this.setState({
            list:dlList.data.list,
            rowCount:dlList.data.rowCount,
            page:pagination.current
        })
        global.WebApp.loading.hide();
    }

    render(){
        return  <div className="box_right" style={{paddingLeft:"0px","paddingRight":'0px'}} >

            <div className="promotion" style={{paddingLeft:"40px","paddingRight":'40px'}} >
                <div className="top_item">
                    <span>{lang.get('推广链接:')}</span>
                    <span className="hrefText">{config.mainDomain + '#/SignUp/' + this.userInfo.user_id}</span>
                </div>
            </div>

            <div className="splitLine"></div>

            <div style={{paddingLeft:"40px","paddingRight":'40px',paddingTop:"20px"}}>

                <div className="top_nav_box">
                    <div className="top_nav">
                        <div className="nav_item">
                            <div className="slider_box"></div>
                            <span className="nav_text">{lang.get('收益汇总')}</span>
                        </div>
                    </div>
                </div> 

                <Table
                    style={{marginTop:"20px"}}
                    size='middle'
                    pagination={false}
                    dataSource={this.state.statics} 
                    columns={this.columnsStatics()}
                    rowKey='coin_id'
                    bordered 
                />

            </div>

            <div className="splitLine"></div>

            <div style={{paddingLeft:"40px","paddingRight":'40px',paddingTop:"20px"}}>

                <div className="top_nav_box">
                    <div className="top_nav">
                        <div className="nav_item">
                            <div className="slider_box"></div>
                            <span className="nav_text">{lang.get('收益明细')}</span>
                        </div>
                    </div>
                </div> 

                <Table
                    style={{marginTop:"20px"}}
                    onChange={this.event_tablesChange.bind(this)}
                    size='middle'
                    pagination={{ pageSize: this.state.pageSize ,current:this.state.page,total:this.state.rowCount }}
                    dataSource={this.state.list} 
                    columns={this.columnsList()}
                    rowKey='user_bonus_id'
                    bordered 
                />
            </div>

        </div>
    } 
}