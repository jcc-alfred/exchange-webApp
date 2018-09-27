import React from 'react';
import {message,Modal} from 'antd';
import io from 'socket.io-client';
import moment from 'moment'
//import ReactKline from 'react-kline';
import ReactKline from '../../assets/react-kline';
import lang from '../../Lang';
import {Http, Store,Utils , config } from '../../Base';

import BuyForm from './BuyForm';
import SellForm from './SellForm';
import ModalBox from './ModalBox';

import '../../assets/Less/exchange.less';
import ReactDOM from 'react-dom';
export default class MarketPage extends React.Component{

    constructor(props){
        super(props);
        this.userInfo = Store.get(config.store.userInfo);
        this.params = this.props.match.params;
        this.state = {
            isShowSearch:false,
            isShowModal:false,
            isExchangeSafe:false,
            entrustPrice:0,
            entrustVolume:0,
            safePass:null,
            entrustTypeId:1,//1 买 0卖 
            coinExAreaList:[],
            defaultCoinExAreaId:null,
            coinExList:[],
            marketList:[],
            currentExList:[],
            market:{},
            coinEx:{},
            defaultCoinExId: null,
            coinList:[],
            assetsList:[],
            coinAssets:{coin:{},assets:{}},
            coinExchangeAssets:{coin:{},assets:{}},
            buyList:[],
            sellList:[],
            buyPrice:'',
            sellPrice:'',
            userEntrustList:[],
            orderList:[],
            isCurrentEntrust:true,
            historyEntrustList:[],
            range:900000,
            klineData:{range:900000,data:{sucess:true,depths:{asks:[],bids:[]},lines:[],trades:[]}}
        }
    }
    componentDidMount(){
        this.load(this.params.id);

        this.updateSize();
        window.addEventListener('resize', () => this.updateSize());
    }

    componentWillMount(){

    }
    componentWillUnmount() {
        window.removeEventListener('resize', () => this.updateSize());
        if(this.socket){
            this.socket.close();
        }
        window.location.reload(true);
    }
    updateSize() {
        let width = window.innerWidth * 0.66 < 800 ? 800 : window.innerWidth * 0.66;
        this.refs.klineControl.resize(width,500)
    }
    async load(id){
        global.WebApp.loading.show();
        let coinExAreaList = await Http.post(config.api.getCoinExchangeAreaList); 
        if(coinExAreaList.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(coinExAreaList.msg));
            return;
        }
        
        let coinExList = await this.loadCoinExList();
        
        if(coinExList.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(coinExList.msg));
            return;
        }

        let marketList = await Http.post(config.api.getMarketList); 
        let currentMarketList = marketList.data.filter(item => item.coinEx.coin_exchange_area_id === coinExAreaList.data[0].coin_exchange_area_id);
        let currentExList = currentMarketList.sort((item1,item2)=>{return item1.coinEx.order_by_num - item2.coinEx.order_by_num});
        //let currentExList = coinExList.data.filter(item => item.coin_exchange_area_id === coinExAreaList.data[0].coin_exchange_area_id);
        let defIndex = id || currentExList[0].coin_exchange_id ;

        let coinEx = coinExList.data.find((item)=>{
            return parseInt(item.coin_exchange_id,10) === parseInt(defIndex,10)
        });
        let currentMarket = marketList.data.find((item)=>{
            return parseInt(item.coin_exchange_id,10) === parseInt(defIndex,10)
        });
        let coinList =  await Http.post(config.api.getCoinList);
        if(coinList.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(coinList.msg));
            return;
        }
        let coin = coinList.data.find((item)=>{
            return parseInt(item.coin_id,10) === parseInt(coinEx.coin_id,10)
        });
        let exchangeCoin = coinList.data.find((item)=>{
            return parseInt(item.coin_id,10) === parseInt(coinEx.exchange_coin_id,10)
        });
        let assetsList = await Http.post(config.api.getUserAssets);
        if(assetsList.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(assetsList.msg));
            return;
        }
        let assets = assetsList.data.find((item)=>{
            return parseInt(item.coin_id,10) === parseInt(coinEx.coin_id,10)
        });
        let exchangeAssets = assetsList.data.find((item)=>{
            return parseInt(item.coin_id,10) === parseInt(coinEx.exchange_coin_id,10)
        });

        this.setState({
            coinExAreaList:coinExAreaList.data,
            defaultCoinExAreaId: coinExAreaList.data[0].coin_exchange_area_id,
            currentExList:currentExList,
            marketList:marketList.data,
            coinExList:coinExList.data,
            coinEx:coinEx || {},
            currentMarket:currentMarket || {},
            defaultCoinExId: parseInt(defIndex,10),
            coinList:coinList.data,
            assetsList:assetsList.data,
            coinAssets:{coin:coin,assets:assets},
            coinExchangeAssets:{coin:exchangeCoin,assets:exchangeAssets}
        },()=>this.initSocket());

        let cLang = lang.getLanguage();
        let kLang = 'en-us';
        if(cLang === 'zh-cn'){
            kLang = 'zh-cn';
        }else if(cLang === 'zh-hk' || cLang === 'zh-tw'){
            kLang = 'zh-tw';
        }else{
            kLang = 'en-us';
        }
        this.refs.klineControl.setLanguage(kLang);
        let symbolName = coinEx.coin_unit+'/'+coinEx.exchange_coin_unit;
        this.refs.klineControl.setSymbol(symbolName,symbolName);
            
        global.WebApp.loading.hide();
    }
    async initSocket(){
        this.socket = io(config.socketDomain);
        if(!this.socket.connected){
            this.socket.connect();
        }
        this.socket.on('connect',()=>{
            console.log('connect:',this.socket.connected);
            this.socket.emit('init',{user_id:this.userInfo.user_id,coin_exchange_id:this.state.coinEx.coin_exchange_id,range:this.state.range});
        })
        this.socket.on('userEntrustList',async(data)=>{
            this.setState({userEntrustList: data});
            let coin = this.state.coinList.find((item)=>{
                return parseInt(item.coin_id,10) === parseInt(this.state.coinEx.coin_id,10)
            });
            let exchangeCoin = this.state.coinList.find((item)=>{
                return parseInt(item.coin_id,10) === parseInt(this.state.coinEx.exchange_coin_id,10)
            });
            let assetsList = await Http.post(config.api.getUserAssets);
            if(assetsList.code===1){
                let assets = assetsList.data.find((item)=>{
                    return parseInt(item.coin_id,10) === parseInt(this.state.coinEx.coin_id,10)
                });
                let exchangeAssets = assetsList.data.find((item)=>{
                    return parseInt(item.coin_id,10) === parseInt(this.state.coinEx.exchange_coin_id,10)
                });
                this.setState({
                    assetsList:assetsList.data,
                    coinAssets:{coin:coin,assets:assets},
                    coinExchangeAssets:{coin:exchangeCoin,assets:exchangeAssets}
                });
            }
        });
        this.socket.on('historyEntrustList',(data)=>{
            this.setState({historyEntrustList: data});
        });
        this.socket.on('entrustList',(data)=>{
            this.setState({buyList: data.buyList});
            this.setState({sellList: data.sellList});
            if(!this.state.buyPrice){
                this.setState({buyPrice:data.sellList.length > 0 ? data.sellList[data.sellList.length -1].entrust_price : ''});
                this.setState({sellPrice:data.buyList.length > 0 ? data.buyList[0].entrust_price : ''});
            }
        });
        this.socket.on('orderList',(data)=>{
            this.setState({orderList: data.slice(0,14)});
        });
        this.socket.on('marketList',(data)=>{
            let currentMarket = data.find((item)=>item.coin_exchange_id === this.state.coinEx.coin_exchange_id);
            let currentMarketList = data.filter(item => item.coinEx.coin_exchange_area_id === this.state.defaultCoinExAreaId);
            let currentExList = currentMarketList.sort((item1,item2)=>{return item1.coinEx.order_by_num - item2.coinEx.order_by_num});
            this.setState({
                marketList: data,
                currentExList:currentExList,
                currentMarket: currentMarket
            });
        });
        this.socket.on('kline',(data)=>{
            this.setState({klineData: data},()=>{console.log(this.state.klineData)});
        });
    }

    async loadCoinExList(){
        let res =  await Http.post(config.api.getCoinExchangeList);        
        if(res.data.length){
            res.data = res.data.filter((item)=>{
                return item.is_enable_trade ? true : false;
            })
        }
        return res;
    }

    async event_changeArea(areaId){
        let currentMarketList = this.state.marketList.filter(item => item.coinEx.coin_exchange_area_id === areaId);
        let currentExList = currentMarketList.sort((item1,item2)=>{return item1.coinEx.order_by_num - item2.coinEx.order_by_num});
        //let currentExList = this.state.coinExList.filter(item => item.coin_exchange_area_id === areaId);
        this.setState({
            defaultCoinExAreaId: areaId,
            currentExList:currentExList
        });
    }

    async event_changeCoinEx(coinExchangeId){
        global.WebApp.loading.show();
        
        let coinEx = this.state.coinExList.find((item)=>{
            return parseInt(item.coin_exchange_id,10) === parseInt(coinExchangeId,10)
        });
        let currentMarket = this.state.marketList.find((item)=>{
            return parseInt(item.coin_exchange_id,10) === parseInt(coinExchangeId,10)
        });
        let coin = this.state.coinList.find((item)=>{
            return parseInt(item.coin_id,10) === parseInt(coinEx.coin_id,10)
        });
        let exchangeCoin = this.state.coinList.find((item)=>{
            return parseInt(item.coin_id,10) === parseInt(coinEx.exchange_coin_id,10)
        });

        let assets = this.state.assetsList.find((item)=>{
            return parseInt(item.coin_id,10) === parseInt(coinEx.coin_id,10)
        });
        let exchangeAssets = this.state.assetsList.find((item)=>{
            return parseInt(item.coin_id,10) === parseInt(coinEx.exchange_coin_id,10)
        });

        this.setState({
            coinEx:coinEx || {},
            currentMarket:currentMarket || {},
            defaultCoinExId: parseInt(coinExchangeId,10),
            coinAssets:{coin:coin,assets:assets},
            coinExchangeAssets:{coin:exchangeCoin,assets:exchangeAssets}
        });
        this.initSocket();
        global.WebApp.loading.hide();
    }

    async event_submitBuy(params){
        this.setState({...params,entrustTypeId : 1},function(){
            if(params.isExchangeSafe){
                this.doEntrust();
            }else{
                this.setState({isShowModal:true});
            }
        });
    }
    async event_submitSell(params){
        this.setState({...params,entrustTypeId : 0},function(){
            if(params.isExchangeSafe){
                console.log('this.state.entrustTypeId111:',this.state.entrustTypeId);
                this.doEntrust();
            }else{
                this.setState({isShowModal:true});
            }
        });
    }
    async event_doEntrustConfirm(params){
        this.setState({isShowModal:false,safePass:params.safePass},function(){ 
            this.doEntrust();
        });
    }
    async doEntrust(){
        if(!this.userInfo.is_safe_pass){
            message.error(lang.get('您还未设置资金密码'));
            return;
        }
        global.WebApp.loading.show();
        let params = {
            coin_exchange_id:this.state.coinEx.coin_exchange_id,
            entrustTypeId:this.state.entrustTypeId,
            isExchangeSafe:this.state.isExchangeSafe,
            safePass:this.state.safePass,
            entrustPrice:this.state.entrustPrice,
            entrustVolume:this.state.entrustVolume
        }
        let res =  await Http.post(config.api.doEntrust,params);
        if(res.code === 1){
            global.WebApp.loading.hide();
            message.success(lang.get('委托成功'));
            console.log(res.data.entrustId);
        }else{
            global.WebApp.loading.hide();
            message.error(lang.get(res.msg));
        }
    }
    async event_cancelEntrust(item){
        let self = this;
        Modal.confirm({
            title: lang.get('操作提示'),
            content: lang.get('是否确认取消委托?'),
            okText: lang.get('是'),
            okType: lang.get('danger'),
            cancelText: lang.get('否'),
            onOk() {
                self.doCancelEntrust(item)
            },
            onCancel() {},
        });
    }
    async doCancelEntrust(item){
        global.WebApp.loading.show();
        let res =  await Http.post(config.api.doCancelEntrust,{entrustId:item.entrust_id,coinExchangeId:item.coin_exchange_id,entrustTypeId:item.entrust_type_id});
        if(res.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(res.msg));
            return;
        }
        message.success(lang.get("操作成功"));
        global.WebApp.loading.hide();
    }
    
    event_showSearch(e){
        this.setState({
            isShowSearch:true
        })
    }
    event_hideSearch(e){
        this.setState({
            isShowSearch:false
        })
    }
    event_changeEntrust(isCurrentEntrust){
        this.setState({isCurrentEntrust : isCurrentEntrust});
        if(!isCurrentEntrust && this.socket){
            this.socket.emit('historyEntrustList',{user_id:this.userInfo.user_id,coin_exchange_id:this.state.coinEx.coin_exchange_id});
        }
    }
    event_search(e){
        let currentMarketList = this.state.marketList.filter(item => item.coinEx.coin_exchange_area_id === this.state.defaultCoinExAreaId);
        let currentExList = [];
        if(e.target.value){
            currentExList = currentMarketList.filter((item)=>{return item.coinEx.coin_unit.toLowerCase().indexOf(e.target.value.toLowerCase()) >= 0});
        }else{
            currentExList = currentMarketList.sort((item1,item2)=>{return item1.coinEx.order_by_num - item2.coinEx.order_by_num});
        }
        this.setState({currentExList : currentExList});        
    }
    onRequestData(param,callback){
        //console.log('param.range:',param.range,'-----klineData.range:',this.state.klineData.range)
        if(param.range === this.state.klineData.range){
            callback(this.state.klineData.data);
        }else{
            this.onRangeChange(param.range);
            callback({sucess:false,depths:{asks:[],bids:[]},lines:[]});
        }
    }
    onRangeChange(range){
        if(this.socket){
            console.log('pre line:',this.state.range);
            this.socket.emit('remove_kline_client',{user_id:this.userInfo.user_id,coin_exchange_id:this.state.coinEx.coin_exchange_id, range:this.state.range});
            this.setState({range:range}); 
            if(this.state.coinEx.coin_exchange_id){
                console.log('new line:',range);
                this.socket.emit('add_kline_client',{user_id:this.userInfo.user_id,coin_exchange_id:this.state.coinEx.coin_exchange_id, range:range});
            }
        }
    }
    toPage(url,e){
        this.props.history.push(url);
        window.location.reload(true);
    }
    render(){
        return (
            <div className="currencyTranTwo">
        <div className="left_div">
            <div className="left_top">
                    <ReactKline ref="klineControl"
                        width={window.innerWidth*0.66}
                        height={500}
                        ranges={["1d","12h","6h","4h", "1h", "30m", "15m", "5m", "1m", "line"]}//1w
                        symbol={""}
                        symbolName={""}
                        intervalTime={1000}
                        depthWidth={50}
                        onRequestData={this.onRequestData.bind(this)}
                        onRangeChange={this.onRangeChange}
                    />
            </div>
            <div className="left_footer">
                <div className="footer_box">
                    <div className="left_nav">
                        <div className={this.state.isCurrentEntrust ? "navItemTitle active" : "navItemTitle"} onClick={this.event_changeEntrust.bind(this,true)}><span>{lang.get('当前委托')}</span></div>
                        <div className={this.state.isCurrentEntrust === false ? "navItemTitle active" : "navItemTitle"} onClick={this.event_changeEntrust.bind(this,false)}><span>{lang.get('历史记录')}</span></div>
                    </div>
                    <div className="right_item">
                        <div className="right_title">
                            <div className="date"><span>{lang.get('委托时间')}</span></div>
                            <div className="type"><span>{lang.get('委托类别')}</span></div>
                            <div className="volume"><span>{lang.get('委托数量')}/{lang.get('已成交')}({this.state.coinEx.coin_unit})</span></div>
                            <div className="price"><span>{lang.get('委托价格')}({this.state.coinEx.exchange_coin_unit})</span></div>
                            <div className="avgPrice"><span>{lang.get('成交均价')}({this.state.coinEx.exchange_coin_unit})</span></div>
                            <div className="totalAmount"><span>{lang.get('成交总额')}({this.state.coinEx.exchange_coin_unit})</span></div>
                            <div className="status"><span>{lang.get('状态')}</span></div>
                            <div className="operation"><span>{lang.get('操作')}</span></div>
                        </div>
                        <div className="right_text_box">
                        {
                            this.state.isCurrentEntrust ? (
                            this.state.userEntrustList.length <= 0 ? 
                                <div className="posiDiv"><div className="posiText">{lang.get('暂无数据')}</div></div> : 
                                    this.state.userEntrustList.map((item,key) => {
                                    return <div className={item.entrust_type_id === 1 ? "text_box_item greenColor" : "text_box_item redColor"} key={key}>
                                    <div className="date"><span>{moment(item.create_time).local().format('YYYY-MM-DD HH:mm:ss')}</span></div>
                                    <div className="type"><span>{item.entrust_type_id === 1 ? lang.get('买单') : lang.get('卖单')}</span></div>
                                    <div className="volume"><span>{Utils.fixNumber(item.entrust_volume,this.state.coinEx.decimal_digits)}/{Utils.fixNumber(item.completed_volume,this.state.coinEx.decimal_digits)}</span></div>
                                    <div className="price"><span>{Utils.fixNumber(item.entrust_price,this.state.coinEx.exchange_decimal_digits)}</span></div>
                                    <div className="avgPrice"><span>{Utils.fixNumber(item.average_price,this.state.coinEx.exchange_decimal_digits)}</span></div>
                                    <div className="totalAmount"><span>{Utils.fixNumber(item.completed_total_amount,this.state.coinEx.exchange_decimal_digits)}</span></div>
                                    <div className={item.entrust_status === 2 ? "status greenColor" : "status redColor"}><span>{lang.get(item.entrust_status_name)}</span></div>
                                    <div className="operation action" onClick={this.event_cancelEntrust.bind(this,item)}><span>{lang.get('取消委托')}</span></div>
                                </div>
                                })
                            ) : this.state.historyEntrustList.length <= 0 ? 
                            <div className="posiDiv"><div className="posiText">{lang.get('暂无数据')}</div></div> : 
                                this.state.historyEntrustList.map((item,key) => {
                                return <div className={item.entrust_type_id === 1 ? "text_box_item greenColor" : "text_box_item redColor"} key={key}>
                                <div className="date"><span>{moment(item.create_time).local().format('YYYY-MM-DD HH:mm:ss')}</span></div>
                                <div className="type"><span>{item.entrust_type_id === 1 ? lang.get('买单') : lang.get('卖单')}</span></div>
                                <div className="volume"><span>{Utils.fixNumber(item.entrust_volume,this.state.coinEx.decimal_digits)}/{Utils.fixNumber(item.completed_volume,this.state.coinEx.decimal_digits)}</span></div>
                                <div className="price"><span>{Utils.fixNumber(item.entrust_price,this.state.coinEx.exchange_decimal_digits)}</span></div>
                                <div className="avgPrice"><span>{Utils.fixNumber(item.average_price,this.state.coinEx.exchange_decimal_digits)}</span></div>
                                <div className="totalAmount"><span>{Utils.fixNumber(item.completed_total_amount,this.state.coinEx.exchange_decimal_digits)}</span></div>
                                <div className={item.entrust_status === 2 ? "status greenColor" : "status redColor"}><span>{lang.get(item.entrust_status_name)}</span></div>
                                <div className="operation"><span>--</span></div>
                            </div>
                            })
                        }
                        </div>
                    </div>
                </div>                    
            </div>
        </div>

        <div className="right_div">
            <div className="right_top">
                <div className="content_right">
                    <div className="right_dataShow">
                        <div className="ri_show_title">
                            <div className="ri_titleItem"><span>{lang.get('卖出')}</span></div>
                            <div className="ri_titleItem"><span>{lang.get('卖出价')}</span></div>
                            <div className="ri_titleItem"><span>{lang.get('委单量')}</span></div>
                        </div>
                        <div className="ri_show_text sell">
                        {
                            this.state.sellList.map((item,index)=>{
                                return <div className="ri_show_item" key={index} onClick={()=>this.setState({buyPrice:item.entrust_price})}>
                                            <div className="ri_showItem redColor"><div className="bsDes">{lang.get('卖')}({this.state.sellList.length - index})</div></div>
                                                <div className="ri_showItem"><div className="bsPrice redColor">{Utils.fixNumber(item.entrust_price,this.state.coinEx.exchange_decimal_digits)}</div></div>
                                                <div className="ri_showItem redColor">
                                                <div className="bacDivRed" style={{width:(item.no_completed_volume/item.entrust_volume)*100 + '%'}}>
                                                    <div className="bsVol">{Utils.fixNumber(item.no_completed_volume,this.state.coinEx.decimal_digits)}</div>
                                                </div>
                                            </div>
                                        </div>
                            })
                        }
                        </div>
                    </div>
                    <div className="right_dataShow">
                        <div className="ri_show_title">
                            <div className="ri_titleItem"><span>{lang.get('买入')}</span></div>
                            <div className="ri_titleItem"><span>{lang.get('买入价')}</span></div>
                            <div className="ri_titleItem"><span>{lang.get('委单量')}</span></div>
                        </div>
                        <div className="ri_show_text">
                        {
                            this.state.buyList.map((item,index)=>{
                                return <div className="ri_show_item" key={index} onClick={()=>this.setState({sellPrice:item.entrust_price})}>
                                            <div className="ri_showItem greenColor"><div className="bsDes">{lang.get('买')}({index+1})</div></div>
                                            <div className="ri_showItem"><div className="bsPrice greenColor">{Utils.fixNumber(item.entrust_price,this.state.coinEx.exchange_decimal_digits)}</div></div>
                                            <div className="ri_showItem greenColor">
                                                <div className="bacDiv" style={{width:(item.no_completed_volume/item.entrust_volume)*100 + '%'}}>
                                                    <div className="bsVol">{Utils.fixNumber(item.no_completed_volume,this.state.coinEx.decimal_digits)}</div>
                                                </div>
                                            </div>
                                        </div>
                            })
                        }
                        </div>
                    </div>
                </div>
                <div className="content_left">
                    <div className="left_item_box">
                        <div className="choose_trading_area" onMouseOver={this.event_showSearch.bind(this)} onMouseOut={this.event_hideSearch.bind(this)}>
                            <div className="titleBox">
                                <p className="title_engh">{(this.state.coinEx.coin_unit || '--')+ '/' + (this.state.coinEx.exchange_coin_unit || '--') }</p>
                                <p className="title_chin">{lang.get('选择交易对')}</p>
                            </div>
                            <div className="right_icon">
                                <i className="icon_gt"></i>
                            </div>
                            <div className="searchDiv" style={{display:this.state.isShowSearch ? 'block' : 'none'}}>
                                <div className="searchInputDiv">
                                    <i className="icon_search" style={{marginLeft:"10px",marginTop:"7px",float: "left"}}></i>
                                    <input type="text" onChange={this.event_search.bind(this)} placeholder={lang.get('交易对')}/>
                                </div>
                                <div className="searchDataDiv">
                                    <div className="title_nav">
                                        {this.state.coinExAreaList.map((item,key)=>{
                                            return <div key={key} className={this.state.defaultCoinExAreaId === item.coin_exchange_area_id ? 'navItem clickActive' : 'navItem'}
                                                    onClick={this.event_changeArea.bind(this,item.coin_exchange_area_id)}>
                                                    <span>{item.coin_exchange_area_name}</span>
                                                    </div>
                                        })}
                                    </div>
                                    <div className="searchItem">
                                        <div className="itemTitleDiv">
                                            <div className="itemTitle"><span>{lang.get('币种')}</span></div>
                                            <div className="itemTitle"><span>{lang.get('最新价格')}</span></div>
                                            <div className="itemTitle"><span>{lang.get('24H涨跌幅')}</span></div>
                                        </div>
                                        <div className="itemContentDiv">
                                            {this.state.currentExList.map((item,key)=>{
                                                return <div key={key} className="itemsDiv" onClick={this.toPage.bind(this,`/market/${item.coin_exchange_id}`)}>{/*onClick={this.event_changeCoinEx.bind(this,item.coin_exchange_id)}*/}
                                                            <div className="itemsText"><span>{item.coinEx.coin_unit}</span></div>
                                                            <div className="itemsText"><span>{Utils.fixNumber(item.market.last_price,item.coinEx.exchange_decimal_digits)}</span></div>
                                                            <div className={item.market.change_rate<0 ?"itemsText redColor" :"itemsText greenColor" }>
                                                                <span>{(item.market.change_rate * 100).toFixed(2) + '%'}</span>
                                                            </div>
                                                        </div>
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="dataTotal">
                            <div className="totalBox">
                                <div className="first_line">
                                    <p className={this.state.currentMarket && this.state.orderList && this.state.orderList.length > 2 ? (this.state.currentMarket.market.last_price >= this.state.orderList[1].trade_price ? "countFont greenColor" : "countFont redColor") : "countFont"}>
                                        {this.state.currentMarket ? Utils.fixNumber(this.state.currentMarket.market.last_price,this.state.coinEx.exchange_decimal_digits) : '--'}</p>
                                    <p className="textFont">{lang.get('最新价格')}</p>
                                </div>
                                <div className="secend_line">
                                    <div className="sec_lineBox">
                                        <div className="boxLeft">
                                            <p className="countFont greenColor">{this.state.currentMarket ? Utils.fixNumber(this.state.currentMarket.market.high_price,this.state.coinEx.exchange_decimal_digits) : '--'}</p>
                                            <p className="textFont">{lang.get('24H最高价')}</p>
                                        </div>
                                        <div className="boxRight">
                                            <p className="countFont redColor">{this.state.currentMarket ? Utils.fixNumber(this.state.currentMarket.market.low_price,this.state.coinEx.exchange_decimal_digits) : '--'}</p>
                                            <p className="textFont">{lang.get('24H最低价')}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="secend_line">
                                    <div className="sec_lineBox">
                                        <div className="boxLeft">
                                            <p className={this.state.currentMarket ? this.state.currentMarket.market.change_rate<0 ?"countFont redColor" :"countFont greenColor" : "countFont" }>
                                                    {(this.state.currentMarket ? (this.state.currentMarket.market.change_rate * 100).toFixed(2) : '--') + '%'}
                                            </p>
                                            <p className="textFont">{lang.get('24H涨跌幅')}</p>
                                        </div>
                                        <div className="boxRight">
                                            <p className="countFont">{this.state.currentMarket ? Utils.fixNumber(this.state.currentMarket.market.total_amount,this.state.coinEx.exchange_decimal_digits) : '--'}</p>
                                            <p className="textFont">{lang.get('24H成交额')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="left_title">
                            <div className="titleItem"><span>{lang.get('成交价格')}</span></div>
                            <div className="titleItem"><span>{lang.get('成交量')}</span></div>
                            <div className="titleItem"><span>{lang.get('时间')}</span></div>
                        </div>
                        <div className="itemsBox">
                        {
                            this.state.orderList.map((item,key)=>{
                            return <div className={item.trigger_type_id === 1 ? "dataDemoBox greenColor" : "dataDemoBox redColor"} key={key}>
                                    <div className="itemText"><span>{Utils.fixNumber(item.trade_price,this.state.coinEx.exchange_decimal_digits)}</span></div>
                                    <div className="itemText grayColor"><span>{Utils.fixNumber(item.trade_volume,this.state.coinEx.decimal_digits)}</span></div>
                                    <div className="itemText grayColor"><span>{moment(item.create_time).local().format('HH:mm:ss')}</span></div>
                                </div>
                            })
                        }
                        </div>
                    </div>
                </div>
            </div>

            <div className="right_footer">
                <div className="content_vertil">
                    <div className="vertilDiv1">
                        <div className="vertilDivTop">
                            <div className="available"><span>{lang.get('可用')}</span></div>
                            <div className="unit"><span>{this.state.coinEx.exchange_coin_unit}</span></div>
                            <div className="topCount redColor"><span>{this.state.coinExchangeAssets.assets ? this.state.coinExchangeAssets.assets.available : '--'}</span></div>
                        </div>
                        <div className="vertilDivTop">
                            <div className="available"><span>{lang.get('可买')}</span></div>
                            <div className="unit"><span>{this.state.coinEx.coin_unit}</span></div>
                            <div className="topCount"><span>{this.state.coinExchangeAssets.assets && this.state.buyPrice ? Utils.fixNumber(this.state.coinExchangeAssets.assets.available/this.state.buyPrice,this.state.coinEx.decimal_digits) : '--'}</span></div>
                        </div>
                    </div>
                    <div className="vertilDiv2">
                        <div className="vertilDivTop">
                            <div className="available"><span>{lang.get('可用')}</span></div>
                            <div className="unit"><span>{this.state.coinEx.coin_unit}</span></div>
                            <div className="topCount greenColor"><span>{this.state.coinAssets.assets ? this.state.coinAssets.assets.available : '--'}</span></div>
                        </div>
                        <div className="vertilDivTop">
                            <div className="available"><span>{lang.get('可卖')}</span></div>
                            <div className="unit"><span>{this.state.coinEx.exchange_coin_unit}</span></div>
                            <div className="topCount"><span>{this.state.coinAssets.assets && this.state.sellPrice ? Utils.fixNumber(this.state.coinAssets.assets.available*this.state.sellPrice,this.state.coinEx.exchange_decimal_digits) : '--'}</span></div>
                        </div>
                    </div>
                </div>
                <div className="footer_bottom">
                    <div className="left_box">
                        <BuyForm coinEx={this.state.coinEx} coinAssets={this.state.coinAssets} coinExchangeAssets={this.state.coinExchangeAssets} 
                        buyPrice={this.state.buyPrice} submit={this.event_submitBuy.bind(this)}  />
                    </div>
                    <div className="right_box">
                            <SellForm coinEx={this.state.coinEx} coinAssets={this.state.coinAssets} coinExchangeAssets={this.state.coinExchangeAssets} 
                            sellPrice={this.state.sellPrice} submit={this.event_submitSell.bind(this)}  />
                    </div>
                </div>
            </div>
        </div>
        <ModalBox isShowModal={this.state.isShowModal} submit={this.event_doEntrustConfirm.bind(this)} hide={()=>{this.setState({isShowModal:false})}}/>
    </div>
        )   
    }
}