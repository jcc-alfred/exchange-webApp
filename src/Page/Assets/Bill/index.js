import React from 'react';
import { Http, config ,Store} from '../../../Base'
import {Table,message,Button,Select,DatePicker} from 'antd'
import lang from '../../../Lang'
import moment from 'moment'

export default class extends React.Component {

    constructor(props){
        super(props);
        this.userInfo = Store.get(config.store.userInfo);
        this.state = {
            coins:[],
            defaultCoin:null,
            types:[],
            defaultType:null,
            logs:[],
            page:1,
            pageSize:10,
            rowCount:0
        }
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

    async loadType(){
        return await Http.post(config.api.getUserAssetsLogTypeList)
    }

    async componentDidMount(){
        global.WebApp.loading.show();
        
        let [coins,types] = await Promise.all([this.loadCoin(),this.loadType()]);

        if(coins.code!==1 && types.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(coins.msg) || lang.get(types.msg));
            return;
        }
        let defaultCoin =  'All';//coins.data[0].coin_id;
        let defaultType = 'All'//types.data[0].user_assets_log_type_id;

        let logs = await Http.post(config.api.getUserAssetsLogList,{
            coinId:defaultCoin,
            userAssetsLogTypeId:defaultType,
            page:this.state.page,
            pageSize:this.state.pageSize,
            startDate:null,
            endDate:null
        });
        if(logs.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(logs.msg));
            return;
        }

        this.setState({
            coins:coins.data,
            defaultCoin:defaultCoin,
            defaultType:defaultType,
            types:types.data,
            logs:logs.data.list,
            rowCount:logs.data.rowCount
        })
        global.WebApp.loading.hide();
    }

    async loadLog(page=1){
        global.WebApp.loading.show();

        let logs = await Http.post(config.api.getUserAssetsLogList,{
            coinId:this.state.defaultCoin,
            userAssetsLogTypeId:this.state.defaultType,
            page:page,
            pageSize:this.state.pageSize,
            startDate:this.state.startDate,
            endDate:this.state.endDate
            
        });

        if(logs.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(logs.msg));
            return;
        }

        this.setState({
            page:page,
            logs:logs.data.list,
            rowCount:logs.data.rowCount
        })
        global.WebApp.loading.hide();
    }

    async event_changeCoin(){
        this.loadType(1)
    }

    async event_tablesChange(pagination, filters, sorter){
        this.loadLog(pagination.current)
    }

    event_datePickerOk(moment,date){
        this.setState({startDate:date[0],endDate:date[1]})
    }

    event_reset(){
        this.setState({
            startDate:null,endDate:null
        })
    }
    async event_submit(){
        this.loadLog(1);
    }

    columns(){
        return  [
            {title:lang.get('时间'),dataIndex:'create_time',align:'center',width:'20%',render: (text) => {return <span>{moment(text).local().format('YYYY-MM-DD HH:mm:ss')}</span>}},
            {title:lang.get('流水号'),dataIndex:'serial_num',align:'center',width:'20%'},
            {title:lang.get('资产类型'),dataIndex:'coin_unit',align:'center',width:'10%'},
            {title:lang.get('收支'),dataIndex:'in_out_type',align:'center',width:'10%',render:(text)=>{return <span style={{color:parseInt(text,10)===2 ? '#ff7171' : '#2cd799'}} >{parseInt(text,10)===2 ? lang.get('支出') : lang.get('收入')}</span>}},
            {title:lang.get('数量'),dataIndex:'trade_amount',align:'center',width:'20%'},
            {title:lang.get('记录类型'),dataIndex:'user_assets_log_type_name',align:'center',width:'20%',render:(text)=>{return lang.get(text)}}
        ]
    }

    render(){
        return  <div className="box_right">

            <div className="title_box">
                <div className="title">
                    <span>{lang.get('币种')} : </span>
                    <Select style={{width:"120px",marginLeft:"5px"}} 
                        size="large" 
                        value={this.state.defaultCoin}
                        onChange={val=>this.setState({defaultCoin:val},()=>{this.loadLog()})}
                    >
                        <Select.Option key="All" value="All">{lang.get('全部')}</Select.Option>
                        {this.state.coins.map((item,key)=>{
                            return <Select.Option key={key} value={item.coin_id}>{item.coin_name}</Select.Option>
                        })}
                    </Select>
                </div>
                <div className="box">
                    <span>{lang.get('时间范围')}  : </span>
                    <DatePicker.RangePicker size="large"  
                        style={{marginLeft:"5px","marginRight": "20px",width:"250px"}} 
                        placeholder={[lang.get('开始时间'),lang.get('结束时间')]}
                        onChange={this.event_datePickerOk.bind(this)} 
                        value={[(this.state.startDate ? moment(this.state.startDate,'YYYY-MM-DD'):null), (this.state.endDate ? moment(this.state.endDate,'YYYY-MM-DD'):null)]}
                    />

                    <span>{lang.get('类型')}  : </span>
                    <Select style={{width:"120px",marginLeft:"5px","marginRight": "20px"}} 
                        size="large" 
                        value={this.state.defaultType}
                        onChange={val=>this.setState({defaultType:val},()=>{this.loadLog()})}
                    >
                        <Select.Option key="All" value="All">{lang.get('全部')}</Select.Option>
                        {this.state.types.map((item,key)=>{
                            return <Select.Option key={key} value={item.user_assets_log_type_id} >{lang.get(item.user_assets_log_type_name)}</Select.Option>
                        })}
                    </Select>

                    <Button type="primary" onClick={this.event_submit.bind(this)} size="large" style={{"marginRight": "20px"}} >{lang.get('搜索')}</Button>
                    <Button type="danger" onClick={this.event_reset.bind(this)} size="large">{lang.get('重置')}</Button>
                </div>
            </div>
            
            <Table 
                style={{marginTop:"20px"}}
                size='middle'
                pagination={{ pageSize: this.state.pageSize ,current:this.state.page,total:this.state.rowCount }}
                onChange={this.event_tablesChange.bind(this)}
                dataSource={this.state.logs} 
                columns={this.columns()}
                rowKey='user_assets_log_id'
                bordered 
            />

        </div>
    } 
}