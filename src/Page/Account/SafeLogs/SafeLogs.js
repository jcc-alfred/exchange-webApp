import React from 'react';
import { Http, config } from '../../../Base'
import {Table,message} from 'antd'
import lang from '../../../Lang'
import moment from 'moment'

export default class extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            data:[],
            page:1,
            pageCount:0,
            rowCount:0,
            loading:false,
        }
    }

    componentDidMount(){
        this.load(1);
    }

    async load(page){
        this.setState({loading:true})
        let res = await Http.post(config.api.getUserLogs,{
            page:page,
            pageSize:10,
        });
        this.setState({loading:false})

        if(res.code===1){
            this.setState({data:res.data.list,pageCount:res.data.pageCount,rowCount:res.data.rowCount});
            this.setState({page:page})
        }
        else{
            message.error(lang.get(res.msg));
        }
    }

    event_tablesChange(pagination, filters, sorter){
        this.load(pagination.current);
    }

    columns(){
        return [
            {   title:lang.get('时间'),
                dataIndex:'create_time',
                key:'create_time',
                render: (text) => {return <span>{moment(text).local().format('YYYY-MM-DD HH:mm:ss')}</span>}
            },
            {title:lang.get('操作'),dataIndex:'log_type_name',key:'log_type_name',render:(text)=>{return lang.get(text)}},
            {title:lang.get('IP地址'),dataIndex:'log_ip',key:'log_ip'},
            {title:lang.get('备注'),dataIndex:'comments',key:'comments',render:(text)=>{return lang.get(text)}}
        ]
    }

    render(){
        return  <div className="box_right">
            <div style={{padding:"40px 40px 0 40px"}}>
                <Table
                    pagination={{ pageSize: 10 ,current:this.state.page,total:this.state.rowCount }}
                    onChange={this.event_tablesChange.bind(this)}
                    dataSource={this.state.data} 
                    columns={this.columns()}
                    rowKey='user_log_id'
                    bordered 
                />
            </div>
        </div>
    } 
}