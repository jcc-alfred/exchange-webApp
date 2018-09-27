import React from 'react';
import { Form, Input,Slider,Button,message } from 'antd';
import { Http,Store,config,Utils } from '../../Base';
import lang from './../../Lang';

const formItemLayout = {
    labelCol: {
        sm: { span: 8 },
    },
    wrapperCol: {
        sm: { span: 16 },
    },
};

class SellForm extends React.Component{

    constructor(props){
        super(props);
        this.userInfo = Store.get(config.store.userInfo);
        this.state = {
            sellTotalAmount:0.00
        };
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.sellPrice !== this.props.sellPrice){
            this.props.form.setFieldsValue({sellPrice:nextProps.sellPrice});
            this.updateTotalAmount("sell");
        }
    }
    validator_sellPrice(rule,value,callback){
        if(!value){
            callback('');
        }
        else if(!Utils.isNum(value)){
            this.props.form.setFieldsValue({sellPrice:''});
            callback('');
        }
        else{
            let newVal = Utils.checkDecimal(value,this.props.coinExchangeAssets.coin.decimal_digits);
            this.props.form.setFieldsValue({sellPrice:newVal});
            this.updateTotalAmount("sell");
            callback();
        }
    }
    validator_sellVolume(rule,value,callback){
        if(!value){
            callback('');
        }
        else if(!Utils.isNum(value)){
            this.props.form.setFieldsValue({sellVolume:''});
            callback('');
        }
        else{
            let newVal = Utils.checkDecimal(value,this.props.coinAssets.coin.decimal_digits);
            this.props.form.setFieldsValue({sellVolume:newVal});
            this.updateTotalAmount("sell");
            callback();
        }
    }
    event_changeSellSlider(value){
        var sellPrice = this.props.form.getFieldValue("sellPrice");
        if (Utils.isNum(this.props.coinAssets.assets.available) && this.props.coinAssets.assets.available > 0 && Utils.isNum(sellPrice) && sellPrice > 0) {
            var sellTotal = Utils.fixNumber(Utils.mul(value/100, this.props.coinAssets.assets.available), this.props.coinAssets.coin.decimal_digits);
            this.props.form.setFieldsValue({sellVolume:sellTotal});
            this.updateTotalAmount("sell");
        }
    }
    updateTotalAmount(type) {
        var buyPrice = this.props.form.getFieldValue("buyPrice"),
            buyVolume = this.props.form.getFieldValue("buyVolume"),
            sellPrice = this.props.form.getFieldValue("sellPrice"),
            sellVolume = this.props.form.getFieldValue("sellVolume");
        var canUseExchangeCoin = parseFloat(this.props.coinExchangeAssets.assets.available);
        var canUseCoin = parseFloat(this.props.coinAssets.assets.available);
        if (type === "buy") {
            if (buyPrice > 0 && buyVolume > 0 && canUseExchangeCoin > 0) {
                var countBuyCoin = Utils.fixNumber(Utils.mul(buyPrice,buyVolume), this.props.coinExchangeAssets.coin.decimal_digits);
                var canBuyCoin = Utils.fixNumber(Utils.div(canUseExchangeCoin,buyPrice), this.props.coinAssets.coin.decimal_digits);
                if (countBuyCoin > canUseExchangeCoin) {
                    this.props.form.setFieldsValue({buyVolume:canBuyCoin});
                    this.setState({buyTotalAmount:Utils.fixNumber(canUseExchangeCoin, this.props.coinExchangeAssets.coin.decimal_digits)});
                    this.props.form.setFieldsValue({buySlider:100});
                    return false;
                }
                else {
                    this.setState({buyTotalAmount:Utils.fixNumber(countBuyCoin, this.props.coinExchangeAssets.coin.decimal_digits)});
                    this.props.form.setFieldsValue({buySlider:Utils.div(countBuyCoin,canUseExchangeCoin) * 100});
                    return false;
                }
            }
            else {
                this.setState({buyTotalAmount:0.00});
                this.props.form.setFieldsValue({buySlider:0});
            }
        }
        else {
            if (sellPrice > 0 && sellVolume > 0) {
                var countSellCoin = Utils.fixNumber(sellPrice * sellVolume, this.props.coinExchangeAssets.coin.decimal_digits);
                var canSellCoin = Utils.fixNumber(sellPrice * canUseCoin, this.props.coinExchangeAssets.coin.decimal_digits);
                if (sellVolume > canUseCoin) {
                    this.props.form.setFieldsValue({sellVolume:Utils.fixDecimal(canUseCoin,this.props.coinAssets.coin.decimal_digits)});
                    this.setState({sellTotalAmount:canSellCoin});
                    this.props.form.setFieldsValue({sellSlider:100});
                    return false;
                }
                else {
                    this.setState({sellTotalAmount:countSellCoin});
                    this.props.form.setFieldsValue({sellSlider:Utils.div(sellVolume,canUseCoin) * 100});
                    return false;
                }
            }
            else {
                this.setState({sellTotalAmount:0.00});
                this.props.form.setFieldsValue({sellSlider:0});
            }
        }
    };
    event_submit(e){
        e.preventDefault();
        if(this.props.coinEx.is_enable_trade !== 1 || this.userInfo.is_enable_trade !== 1){
            message.error(lang.get('暂不支持交易功能'));
            return;
        }
        this.props.form.validateFields(async (err,values)=>{
            if (err) {
                return;
            }

            if(!this.userInfo.is_safe_pass){
                message.error(lang.get('您还未设置资金密码'));
                return;
            }
            let res =  await Http.post(config.api.getIsExchangeSafe);
            let isExchangeSafe = false;
            if(res.code === 1){
                if(res.data.isExchangeSafe){
                    //安全
                    isExchangeSafe = true;
                }else{
                    //需要输入资金密码
                    isExchangeSafe = false;
                }
            }else{
                message.error(lang.get(res.msg));
                return
            }
            if(this.props.coinEx.entrust_min_price > values.sellPrice){
                message.error(lang.get('委托价格不能低于:') + this.props.coinEx.entrust_min_price);
                return;
            }
            if(this.props.coinEx.entrust_min_amount > values.sellVolume){
                message.error(lang.get('委托数量不能低于:') + this.props.coinEx.entrust_min_amount);
                return;
            }
            if(this.props.coinAssets.assets.available < values.sellVolume){
                message.error(lang.get('委托数量大于可用数量'));
                return;
            }
            let params = {
                isExchangeSafe:isExchangeSafe,
                entrustPrice:values.sellPrice,
                entrustVolume:values.sellVolume
            };
            this.props.submit(params);
            //this.props.form.setFieldsValue({sellPrice:''});
            this.props.form.setFieldsValue({sellVolume:''});
            this.props.form.setFieldsValue({sellSlider:0});
            this.setState({sellTotalAmount:0});
        })
    }

    render(){
        return  (
            <Form onSubmit={this.event_submit.bind(this)}>
                <div className="box_son">
                    <div className="headerBox">
                        <div className="bsDiv redColor"><span>{lang.get('卖出')} {this.props.coinEx.coin_unit}</span></div>
                        <div className="withrawDiv"><span>{lang.get('提现')}</span></div>
                        <div className="depositDiv"><span>{lang.get('充值')}</span></div>
                    </div>
                    <div className="twoBox">
                        <div className="twoBox_left">
                            <Form.Item {...formItemLayout} label={<span className="leftText">{lang.get('价格')}</span>} colon={false}>
                                {this.props.form.getFieldDecorator('sellPrice',
                                    {
                                        rules:[{validator:this.validator_sellPrice.bind(this)}]
                                    }
                                )(<Input type="text" autoComplete="off" className="sellInput" maxLength={15} />)} 
                            </Form.Item>
                        </div>
                        <div className="twoBox_right">
                            <span>{this.props.coinEx.exchange_coin_unit}</span>
                        </div>
                    </div>
                    <div className="twoBox mt">
                        <div className="twoBox_left">
                            <Form.Item {...formItemLayout} label={<span className="leftText">{lang.get('数量')}</span>} colon={false}>
                                {this.props.form.getFieldDecorator('sellVolume',
                                    {rules:[{validator:this.validator_sellVolume.bind(this)}]}
                                )(<Input type="text" autoComplete="off" className="sellInput" maxLength={15} />)} 
                            </Form.Item>
                        </div>
                        <div className="twoBox_right">
                            <span>{this.props.coinEx.coin_unit}</span>
                        </div>
                    </div>
                    <div className="fourBox">
                    <Form.Item>
                        {this.props.form.getFieldDecorator('sellSlider')(
                            <Slider marks={{0: '0%',25: '25%',50: '50%',75: '75%',100: '100%',}} onChange={this.event_changeSellSlider.bind(this)}/>
                        )}
                    </Form.Item>
                    </div>
                    <div className="fiveBox">
                        <div className="totalAmount"><span>{lang.get('交易额')}</span></div>
                        <div className="totalAmountCount redColor"><span>{this.state.sellTotalAmount}</span></div>
                        <div className="totalAmountName"><span>{this.props.coinEx.exchange_coin_unit}</span></div>
                        <div className="totalAmountRate">{lang.get('手续费')}(<span className="redColor">{this.props.coinEx.sell_fees_rate * 100 + '%'}</span>)</div>
                    </div>
                    <div className="sixBtn">
                        <Button className="sellButton" type="submit" htmlType="submit">{lang.get('立即卖出')}</Button>
                    </div>
                </div>
            </Form>
        )
    }
}

export default Form.create()(SellForm);