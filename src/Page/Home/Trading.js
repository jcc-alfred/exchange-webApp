import React from 'react';
import {message} from 'antd';
import io from 'socket.io-client';
import {Http,Utils , config } from '../../Base';
import lang from '../../Lang';

export default class Trading extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            coinExAreaList:[],
            defaultCoinExAreaId:null,
            marketList:[],
            currentMarketList:[]
        }
    }
    componentDidMount(){
        this.load();
    }
    async load(){
        global.WebApp.loading.show();
        let coinExAreaList = await Http.post(config.api.getCoinExchangeAreaList); 
        if(coinExAreaList.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(coinExAreaList.msg));
            return;
        }

        let marketList = await Http.post(config.api.getMarketList); 
        let currentMarketList = marketList.data.filter(item => item.coinEx.coin_exchange_area_id === coinExAreaList.data[0].coin_exchange_area_id);
        currentMarketList = currentMarketList.sort((item1,item2)=>{return item1.coinEx.order_by_num - item2.coinEx.order_by_num});

        this.setState({
            coinExAreaList:coinExAreaList.data,
            defaultCoinExAreaId: coinExAreaList.data[0].coin_exchange_area_id,
            marketList:marketList.data,
            currentMarketList: currentMarketList
        },()=>this.initSocket());

        global.WebApp.loading.hide();
    }
    async initSocket(){
        this.socket = io(config.socketDomain);
        if(!this.socket.connected){
            this.socket.connect();
        }
        this.socket.on('connect',()=>{
            console.log('connect:',this.socket.connected);
            //this.socket.emit('init',{user_id:this.userInfo.user_id,coin_exchange_id:this.state.coinEx.coin_exchange_id,range:this.state.range});
        });
        this.socket.on('marketList',(data)=>{
            let currentMarketList = data.filter(item => item.coinEx.coin_exchange_area_id === this.state.defaultCoinExAreaId);
            currentMarketList = currentMarketList.sort((item1,item2)=>{return item1.coinEx.order_by_num - item2.coinEx.order_by_num});
            this.setState({
                marketList: data,
                currentMarket: currentMarketList
            });
        });
    }
    async event_changeArea(areaId){
        let currentMarketList = this.state.marketList.filter(item => item.coinEx.coin_exchange_area_id === areaId);
        currentMarketList = currentMarketList.sort((item1,item2)=>{return item1.coinEx.order_by_num - item2.coinEx.order_by_num});
        this.setState({
            defaultCoinExAreaId: areaId,
            currentMarketList:currentMarketList
        });
    }
    event_search(e){
        let currentMarketList = this.state.marketList.filter(item => item.coinEx.coin_exchange_area_id === this.state.defaultCoinExAreaId);
        let tmpList = [];
        if(e.target.value){
            tmpList = currentMarketList.filter((item)=>{return item.coinEx.coin_unit.toLowerCase().indexOf(e.target.value.toLowerCase()) >= 0});
        }else{
            tmpList = currentMarketList.sort((item1,item2)=>{return item1.coinEx.order_by_num - item2.coinEx.order_by_num});
        }
        this.setState({currentMarketList : tmpList});        
    }
    toPage(url,e){
        this.props.toPage(url);
    }
    render() {
        return <div className="quotes">
            <div className="quotes_box">
                <div className="left_nav">
                    {this.state.coinExAreaList.map((item,key)=>{
                        return <div key={key} className={this.state.defaultCoinExAreaId === item.coin_exchange_area_id ? 'nav_item active' : 'nav_item'}
                                onClick={this.event_changeArea.bind(this,item.coin_exchange_area_id)}>
                                <i className={this.state.defaultCoinExAreaId === item.coin_exchange_area_id ? 'icon_wave_line_active' : 'icon_wave_line'}></i>
                                <span>{item.coin_exchange_area_name} {lang.get('交易区')}</span>
                                </div>
                    })}
                    <div className="quotes_search">
                        <i style={{ marginLeft: '16px', marginTop: '6px' }} className="icon_search"></i>
                        <input type="text" onChange={this.event_search.bind(this)} placeholder={lang.get('交易对')} />
                    </div>
                </div>
                
                <div className="quotes_header">
                    
                    <div className="col_0">
                        <span>{lang.get('币种')}</span>
                    </div>
                    <div className="col_1">
                        <span>{lang.get('最新价格')}</span>
                    </div>
                    <div className="col_2">
                        <span>{lang.get('24H最高价')}</span>
                    </div>
                    <div className="col_3">
                        <span>{lang.get('24H最低价')}</span>
                    </div>
                    <div className="col_4">
                        <span>{lang.get('24H涨跌幅')}</span>
                    </div>
                    <div className="col_5">
                        <span>{lang.get('24H成交额')}</span>
                    </div>
                    <div className="col_6">
                        <span>{lang.get('操作')}</span>
                    </div>
                </div>
                <div className="quotes_detail">
                    
                    <div className="right_box">
                        {this.state.currentMarketList.map((item,key,index)=>{
                            return <div key={key} className={key%2 === 0 ? "row" : "row gray"}>
                                        <div className="col_0">
                                            <span>{item.coinEx.coin_unit + '/' + item.coinEx.exchange_coin_unit}</span>
                                        </div>
                                        <div className="col_1">
                                            <span>{item.coinEx.exchange_coin_symbol + Utils.fixNumber(item.market.last_price,item.coinEx.exchange_decimal_digits)}</span>
                                        </div>
                                        <div className="col_2 greenColor">
                                            <span>{item.coinEx.exchange_coin_symbol + Utils.fixNumber(item.market.high_price,item.coinEx.exchange_decimal_digits)}</span>
                                        </div>
                                        <div className="col_3 redColor">
                                            <span>{item.coinEx.exchange_coin_symbol + Utils.fixNumber(item.market.low_price,item.coinEx.exchange_decimal_digits)}</span>
                                        </div>
                                        <div className={item.market.change_rate < 0 ?"col_4 redColor" :"col_4 greenColor" }>
                                            <span>{(item.market.change_rate * 100).toFixed(2) + '%'}</span>
                                        </div>
                                        <div className="col_5">
                                            <span>{item.coinEx.exchange_coin_symbol + Utils.fixNumber(item.market.total_amount,item.coinEx.exchange_decimal_digits)}</span>
                                        </div>
                                        <div className="col_6" onClick={this.toPage.bind(this,`/exchange/${item.coin_exchange_id}`)}>
                                            <i className="icon_exchange"></i>
                                        </div>
                                    </div>
                        })}
                    </div>
                </div>
            </div>
        </div>
    }
}