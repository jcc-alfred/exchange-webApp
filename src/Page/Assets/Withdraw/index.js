import React from 'react';
import { Http, config ,Store} from '../../../Base'
import {Table,message,Select,Modal} from 'antd'
import lang from '../../../Lang';
import moment from 'moment'

import FormBox from './FormBox';

export default class extends React.Component {

    constructor(props){
        super(props);
        this.userInfo = Store.get(config.store.userInfo);
        this.params = this.props.match.params;
        
        this.status = {
            '-1':lang.get('已取消'),
            0:lang.get('审核中'),
            1:lang.get('已审核'),
            2:lang.get('提现成功'),
            3:lang.get('提现失败')
        }

        this.state = {
            coins:[],
            coin:null,
            defaultCoin: null,
            dl:[],
            page:1,
            pageSize:10,
            rowCount:0
        }
    }
    
    componentDidMount(){
        this.load(this.params.id);
    }

    async load(id,page=1){
        global.WebApp.loading.show();
       
        let coinList = await this.loadCoin();
        
        if(coinList.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(coinList.msg));
            return;
        }

        let defIndex = id || coinList.data[0].coin_id ;

        let dlList = await this.loadList(defIndex , this.state.page);
    
        if(dlList.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(dlList.msg));
            return;
        }

        let coin = coinList.data.find((item)=>{
            return parseInt(item.coin_id,10) === parseInt(defIndex,10)
        })
        this.setState({
            coins:coinList.data,
            coin:coin || {},
            dl:dlList.data.list,
            defaultCoin: parseInt(defIndex,10) ,
            page:page,
            rowCount:dlList.data.rowCount
        })

        global.WebApp.loading.hide();
    }

    async loadCoin(){
        let res =  await Http.post(config.api.getCoinList);        
        if(res.data.length){
            res.data = res.data.filter((item)=>{
                return item.is_enable_withdraw ? true : false;
            })
        }
        return res
    }

    async loadList(coinId,page){
        return await Http.post(config.api.getUserWithdrawListByCoinId,{
            page:page,
            pageSize:this.state.pageSize,
            coinId:coinId
        });
    }

    async event_tablesChange(pagination, filters, sorter){

        global.WebApp.loading.show();

        let dlList = await this.loadList(this.state.defaultCoin , pagination.current);
    
        if(dlList.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(dlList.msg));
            return;
        }

        this.setState({
            dl:dlList.data.list,
            rowCount:dlList.data.rowCount,
            page:pagination.current
        })
        global.WebApp.loading.hide();
    }
    async cancelConfirm(id){
        let self = this;
        Modal.confirm({
            title: lang.get('操作提示'),
            content: lang.get('是否确认取消提现?'),
            okText: lang.get('是'),
            okType: 'danger',
            cancelText: lang.get('否'),
            onOk() {
                self.cancel(id)
            },
            onCancel() {},
        });
    }
    async cancel(id){
        global.WebApp.loading.hide();

        let res = await Http.post(config.api.cancelUserWithdraw,{userWithdrawId:id});
       
        if(res.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(res.msg));
            return;
        }

        let dlList = await this.loadList(this.state.defaultCoin , 1);
    
        if(dlList.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(dlList.msg));
            return;
        }

        this.setState({
            dl:dlList.data.list,
            rowCount:dlList.data.rowCount,
            page:1
        })
        global.WebApp.loading.hide();
        
    }

    event_submit(){
        this.load(this.state.coin.coin_id);
    }

    columns(){
        return  [
            {title:lang.get('流水号'),dataIndex:'serial_num',align:'center',width:'15%'},
            {title:lang.get('提现地址'),dataIndex:'to_block_address',render:(text)=>{return <div style={{textAlign:'left'}}>{text}</div>},align:'center',width:'17%'},
            {title:lang.get('提现数量'),dataIndex:'submit_amount',align:'center',width:'10%'},
            {title:lang.get('手续费'),dataIndex:'fees',align:'center',width:'10%'},
            {title:lang.get('处理时间'),dataIndex:'confirm_time',align:'center',width:'15%',render: (text) => {return <span>{ text ? moment(text).local().format('YYYY-MM-DD HH:mm:ss') : ''}</span>}},
            {title:lang.get('状态'),dataIndex:'confirm_status',align:'center',width:'10%', render:(text)=>{return text===3 || text === -1 ? <span style={{color:'#fe9797'}}>{this.status[text]}</span>: <span style={{color:'#30d49c'}}>{this.status[text]}</span> }},
            {title:lang.get('操作'),align:'center',width:'8%',render:(item)=>{return item.confirm_status===0 ?  <a onClick={this.cancelConfirm.bind(this,item.user_withdraw_id)}>{lang.get('取消')}</a> : null}  },
        ]
    }

    render(){
        return  <div className="box_right" style={{paddingLeft:"0px","paddingRight":'0px'}} >
            <div className="box_right_box" style={{paddingLeft:"40px","paddingRight":'40px'}}>
                <div className="title_box">
                    <div className="title">
                        <span>{lang.get('币种')} : </span>
                        <Select style={{width:"120px",marginLeft:"5px"}} 
                            size="large" 
                            value={this.state.defaultCoin}
                            onChange={(val)=>{
                                this.setState({defaultCoin:val})
                                this.load(val,1)
                            }}
                        >
                            {this.state.coins.map((item,key)=>{
                                return <Select.Option key={key} value={item.coin_id} >{item.coin_name}</Select.Option>
                            })}
                        </Select>
                    </div>
                </div>
                
                {this.state.coin && <FormBox  ref="FormBox" coin={this.state.coin}  submit={this.event_submit.bind(this)}  />}

            </div>

            <div className="splitLine"></div>

            <div style={{paddingLeft:"40px","paddingRight":'40px',paddingTop:"20px"}}>

                <div className="top_nav_box">
                    <div className="top_nav">
                        <div className="nav_item">
                            <div className="slider_box"></div>
                            <span className="nav_text">{lang.get('提现记录')}</span>
                        </div>
                    </div>
                </div> 

                {this.state.coin && <Table
                    style={{marginTop:"20px"}}
                    onChange={this.event_tablesChange.bind(this)}
                    size='middle'
                    pagination={{ pageSize: this.state.pageSize ,current:this.state.page,total:this.state.rowCount }}
                    dataSource={this.state.dl} 
                    columns={this.columns()}
                    rowKey='user_withdraw_id'
                    bordered 
                />}
            </div>

        </div>
    } 
}