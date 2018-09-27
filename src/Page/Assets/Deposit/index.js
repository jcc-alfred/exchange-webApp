import React from 'react';
import { Http, config ,Store} from '../../../Base'
import {Table,message,Select} from 'antd'
import lang from '../../../Lang'
import moment from 'moment'

export default class extends React.Component {

    constructor(props){
        super(props);
        this.userInfo = Store.get(config.store.userInfo);
        this.params = this.props.match.params;
        this.state = {
            coins:[],
            coin:{},
            defaultCoin: null,
            assetsList:[],
            assets:{},
            dl:[],
            page:1,
            pageSize:10,
            rowCount:0
        }
    }

    async componentDidMount(){
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

        let assetsList = await Http.post(config.api.getUserAssets);
        if(assetsList.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(assetsList.msg));
            return;
        }
        let assets = assetsList.data.find((item)=>{
            return parseInt(item.coin_id,10) === parseInt(defIndex,10)
        });

        let dlList = await this.loadList(defIndex , this.state.page);
    
        if(dlList.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(dlList.msg));
            return;
        }

        let coin = coinList.data.find((item)=>{
            return parseInt(item.coin_id,10) === parseInt(defIndex,10)
        });

        this.setState({
            coins:coinList.data,
            coin:coin || {},
            assetsList:assetsList.data,
            assets:assets,
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
                return item.is_enable_deposit ? true : false;
            })
        }
        return res
    }

    async loadList(coinId,page){
        return await Http.post(config.api.getUserDepositListByCoinId,{
            page:page,
            pageSize:this.state.pageSize,
            coinId:coinId
        });
    }

    async event_tablesChange(pagination, filters, sorter){
   
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
    }
    
    columns(){
        return  [
            {title:lang.get('流水号'),dataIndex:'serial_num',align:'center',width:'20%'},
            {title:lang.get('时间'),dataIndex:'create_time',align:'center',width:'20%',render: (text) => {return <span>{moment(text).local().format('YYYY-MM-DD HH:mm:ss')}</span>}},
            {title:lang.get('资产类型'),dataIndex:'coin_id',align:'center',width:'20%',render:(text)=>{return <span>{this.state.coin.coin_name}</span>}},
            {title:lang.get('数量'),dataIndex:'trade_amount',align:'center',width:'20%'},
            {title:lang.get('状态'),dataIndex:'confirm_status_name',align:'center',width:'20%',render:(text)=>{return <span style={{color:'#30d49c'}}>{lang.get(text)}</span>}},
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


                <div className="top_item">
                    <div className="item_left">
                        <div className="addr_text"><span>{this.state.coin.coin_name} {lang.get('充值地址')}</span></div>
                        <div className="code_box">
                            <img src={`${config.api.domain}qrcode?code=${this.state.assets ? this.state.assets.block_address:''}`} alt="" />
                        </div>
                    </div>
                    <div className="item_right">
                        <div className="addr_href">
                            <span className="address_text">{lang.get('充值地址')}</span>
                            <span className="colorText">{this.state.assets ? this.state.assets.block_address : ''}</span>
                        </div>
                        <div className="recharge_desc">
                            <div className="recharge_title"><span>{lang.get('充值须知')}</span></div>
                            <div style={{textAlign:"left"}} dangerouslySetInnerHTML = {{ __html:lang.get(this.state.coin.deposit_tips_key) }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="splitLine"></div>
            
            <div style={{paddingLeft:"40px","paddingRight":'40px',paddingTop:"20px"}}>
                <div className="top_nav_box">
                    <div className="top_nav">
                        <div className="nav_item">
                            <div className="slider_box"></div>
                            <span className="nav_text">{lang.get('充值记录')}</span>
                        </div>
                    </div>
                </div>

                <Table
                    style={{marginTop:"20px"}}
                    onChange={this.event_tablesChange.bind(this)}
                    size='middle'
                    pagination={{ pageSize: this.state.pageSize ,current:this.state.page,total:this.state.rowCount }}
                    dataSource={this.state.dl} 
                    columns={this.columns()}
                    rowKey='user_deposit_id'
                    bordered 
                />
            </div>
        </div>
    } 
}