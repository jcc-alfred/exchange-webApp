import React from 'react';
import {message,Select,Form,Modal} from 'antd';
import { Http, config ,Store ,Utils} from '../../../Base'
import lang from '../../../Lang'    
import Add from './Add'

class AccountPage  extends React.Component {

    constructor(props){
        super(props);
        this.userInfo = Store.get(config.store.userInfo);
        this.params = this.props.match.params;
        this.codeType = Utils.getSendCodeType(this.userInfo);
        this.state = {
            coins:[],
            coin:{},
            defaultCoin: null,
            addVisible:false,
            delVisible:false,
            data:[],
        }
    }

    async componentDidMount(){
        this.load(this.params.id)

    }
    async load(id){
        global.WebApp.loading.show();
        let coinList = await this.loadCoin();
        
        if(coinList.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(coinList.msg));
            return;
        }
        let defIndex = id || coinList.data[0].coin_id ;

        let coin = coinList.data.find((item)=>{
            return parseInt(item.coin_id,10) === parseInt(defIndex,10)
        })

        this.setState({
            coins:coinList.data,
            coin:coin || {},
            defaultCoin: parseInt(defIndex,10) ,
        })

        let account = await this.loadAccount(coin.coin_id);
        

        if(account.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(account.msg));
            return;
        }

        this.setState({
            data:account.data
        })

    
        global.WebApp.loading.hide();
    }

    async loadCoin(){
        let res =  await Http.post(config.api.getCoinList);        
        // if(res.data.length){
        //     res.data = res.data.filter((item)=>{
        //         return item.is_enable_deposit ? true : false;
        //     })
        // }
        return res
    }

    async loadAccount(coin_id){
        return Http.post(config.api.getUserWithdrawAccountByCoinId,{coinId:coin_id});
    }

    async delAccount(id){
        global.WebApp.loading.show();
        let res =  await Http.post(config.api.delUserWithdrawAccount,{userWithdrawAccountId:id});
        if(res.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(res.msg));
            return;
        }
        
        let account = await this.loadAccount(this.state.coin.coin_id);

        if(account.code!==1){
            global.WebApp.loading.hide();
            message.error(lang.get(account.msg));
            return;
        }

        this.setState({
            data:account.data
        })

        message.success(lang.get("操作成功"));
        global.WebApp.loading.hide();
    }

    addSubmit(data){
        this.setState({
            data:data
        })
    }

    event_delShow(id){
        let self = this;
        Modal.confirm({
            title: lang.get('操作提示'),
            content: lang.get('是否确认删除?'),
            okText: lang.get('是'),
            okType: 'danger',
            cancelText: lang.get('否'),
            onOk() {
                self.delAccount(id)
            },
            onCancel() {},
        });
    }

    render(){
        return  <div className="box_right">
            <div className="address_box">
                <div className="title_box">
                    <div className="title">
                        <span>{lang.get('币种')} : </span>
                        <Select style={{width:"120px",marginLeft:"5px"}} 
                            size="large" 
                            value={this.state.defaultCoin}
                            onChange={async (val)=>{
                                this.load(val);
                            }}
                        >
                            {this.state.coins.map((item,key)=>{
                                return <Select.Option key={key} value={item.coin_id} >{item.coin_name}</Select.Option>
                            })}
                        </Select>
                    </div>
                </div>
                <div className="address_content">
                    
                    <div className="address_manage" >
                        {this.state.data.map((item,key)=>{
                            return <div className="have_address" key={key}>  
                                <div className="address_header"><span>{item.memo}</span></div>
                                <div className="address_center">
                                    <div className="text_box"><span>{item.block_address}</span></div>
                                </div>
                                <div className="delete_btn" onClick={this.event_delShow.bind(this,item.user_withdraw_account_id)}><span>{lang.get('删除')}</span></div>
                            </div>
                        
                        })}
                    </div>

                    <div className="add_address">
                        <img src={require('../../../assets/img/add.png')} alt=""  onClick={()=>{
                            this.setState({addVisible:true})
                        }} />
                    </div>


                </div>

                <Add ref="add" submit={this.addSubmit.bind(this)} visible={this.state.addVisible} coin={this.state.coin} show={()=>{this.setState({addVisible:true})}} hide={()=>{this.setState({addVisible:false})}} />
            </div>
        </div>
    } 
}

export default Form.create()(AccountPage);