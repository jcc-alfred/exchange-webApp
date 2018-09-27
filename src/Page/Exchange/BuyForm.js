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

class BuyForm extends React.Component{

    constructor(props){
        super(props);
        this.userInfo = Store.get(config.store.userInfo);
        this.state = {
            buyTotalAmount:0.00
        };
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.buyPrice !== this.props.buyPrice){
            this.props.form.setFieldsValue({buyPrice:nextProps.buyPrice});
            this.updateTotalAmount("buy");
        }
    }
    validator_buyPrice(rule,value,callback){
        if(!value){
            callback('');
        }
        else if(!Utils.isNum(value)){
            this.props.form.setFieldsValue({buyPrice:''});
            callback('');
        }
        else{
            let newVal = Utils.checkDecimal(value,this.props.coinExchangeAssets.coin.decimal_digits);
            this.props.form.setFieldsValue({buyPrice:newVal});
            this.updateTotalAmount("buy");
            callback();
        }
    }
    validator_buyVolume(rule,value,callback){
        if(!value){
            callback('');
        }
        else if(!Utils.isNum(value)){
            this.props.form.setFieldsValue({buyVolume:''});
            callback('');
        }
        else{
            let newVal = Utils.checkDecimal(value,this.props.coinAssets.coin.decimal_digits);
            this.props.form.setFieldsValue({buyVolume:newVal});
            this.updateTotalAmount("buy");
            callback();
        }
    }
    event_changeBuySlider(value){
        var buyPrice = this.props.form.getFieldValue("buyPrice");
        if (Utils.isNum(this.props.coinExchangeAssets.assets.available) && this.props.coinExchangeAssets.assets.available > 0 && Utils.isNum(buyPrice) && buyPrice > 0) {
            var buyTotal = Utils.fixNumber(Utils.mul(value/100, Utils.div(this.props.coinExchangeAssets.assets.available,buyPrice)), this.props.coinAssets.coin.decimal_digits);
            this.props.form.setFieldsValue({buyVolume:buyTotal});
            this.updateTotalAmount("buy");
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
                    this.props.form.setFieldsValue({buySlider:Utils.div(sellVolume,canUseCoin) * 100});
                    return false;
                }
            }
            else {
                this.setState({sellTotalAmount:0.00});
                this.props.form.setFieldsValue({buySlider:0});
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
                return;
            }
            if(this.props.coinEx.entrust_min_price > values.buyPrice){
                message.error(lang.get('委托价格不能低于:') + this.props.coinEx.entrust_min_price);
                return;
            }
            if(this.props.coinEx.entrust_min_amount > values.buyVolume){
                message.error(lang.get('委托数量不能低于:') + this.props.coinEx.entrust_min_amount);
                return;
            }
            let totalAmount = Utils.mul(values.buyPrice,values.buyVolume);
            if(this.props.coinExchangeAssets.assets.available < totalAmount){
                message.error(lang.get('委托数量大于可用数量'));
                return;
            }
            let params = {
                isExchangeSafe:isExchangeSafe,
                entrustPrice:values.buyPrice,
                entrustVolume:values.buyVolume
            };
            this.props.submit(params);
            //this.props.form.setFieldsValue({buyPrice:''});
            this.props.form.setFieldsValue({buyVolume:''});
            this.props.form.setFieldsValue({buySlider:0});
            this.setState({buyTotalAmount:0});
        })
    }

    render(){
        return  (
            <Form onSubmit={this.event_submit.bind(this)}>
                <div className="box_son">
                    <div className="headerBox">
                        <div className="bsDiv greenColor"><span>{lang.get('买入')} {this.props.coinEx.coin_unit}</span></div>
                        <div className="withrawDiv"><span>{lang.get('提现')}</span></div>
                        <div className="depositDiv"><span>{lang.get('充值')}</span></div>
                    </div>
                    <div className="twoBox">
                        <div className="twoBox_left">
                            <Form.Item {...formItemLayout} label={<span className="leftText">{lang.get('价格')}</span>} colon={false}>
                                {this.props.form.getFieldDecorator('buyPrice',
                                    {
                                        rules:[{validator:this.validator_buyPrice.bind(this)}]
                                    }
                                )(<Input type="text" autoComplete="off" className="buyInput" maxLength={15} />)} 
                            </Form.Item>
                        </div>
                        <div className="twoBox_right">
                            <span>{this.props.coinEx.exchange_coin_unit}</span>
                        </div>
                    </div>
                    <div className="twoBox mt">
                        <div className="twoBox_left">
                            <Form.Item {...formItemLayout} label={<span className="leftText">{lang.get('数量')}</span>} colon={false}>
                                {this.props.form.getFieldDecorator('buyVolume',
                                    {rules:[{validator:this.validator_buyVolume.bind(this)}]}
                                )(<Input type="text" autoComplete="off" className="buyInput" maxLength={15} />)} 
                            </Form.Item>
                        </div>
                        <div className="twoBox_right">
                            <span>{this.props.coinEx.coin_unit}</span>
                        </div>
                    </div>
                    <div className="fourBox">
                    <Form.Item>
                        {this.props.form.getFieldDecorator('buySlider')(
                            <Slider marks={{0: '0%',25: '25%',50: '50%',75: '75%',100: '100%',}} onChange={this.event_changeBuySlider.bind(this)}/>
                        )}
                    </Form.Item>
                    </div>
                    <div className="fiveBox">
                        <div className="totalAmount"><span>{lang.get('交易额')}</span></div>
                        <div className="totalAmountCount"><span>{this.state.buyTotalAmount}</span></div>
                        <div className="totalAmountName"><span>{this.props.coinEx.exchange_coin_unit}</span></div>
                        <div className="totalAmountRate">{lang.get('手续费')}(<span>{this.props.coinEx.buy_fees_rate * 100 + '%'}</span>)</div>
                    </div>
                    <div className="sixBtn">
                        <Button className="buyButton" type="submit" htmlType="submit">{lang.get('立即买入')}</Button>
                    </div>
                </div>
            </Form>
        )
    }
}

export default Form.create()(BuyForm);