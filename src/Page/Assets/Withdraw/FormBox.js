import React from 'react';
import { Http, config ,Store,Utils} from '../../../Base'
import {message,Button,Form,Input,Col,AutoComplete} from 'antd'
import { Link } from 'react-router-dom';
import lang from '../../../Lang'

const formItemLayout = {
    labelCol: {
        sm: { span: 8 },
    },
    wrapperCol: {
        sm: { span: 10 },
    },
};

class FormBox extends React.Component {

    constructor(props){
        super(props);
        this.userInfo = Store.get(config.store.userInfo);
        this.codeType = Utils.getSendCodeType(this.userInfo);
        this.state = {
            visible:false,
            oldIsDisabled:false,
            oldCodeText:lang.get('获取验证码'),
            address:[],
            addVal:"",
            assetsList:[],
            assets:{},
        }
    }
    async componentDidMount(){
        this.loadData(this.props.coin.coin_id);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.coin.coin_id !== this.props.coin.coin_id) {
            
            this.props.form.setFieldsValue({toBlockAddress:''});
            this.props.form.setFieldsValue({submitAmount:''});
            this.props.form.setFieldsValue({safePass:''});
            this.props.form.setFieldsValue({googleCode:''});
            this.props.form.setFieldsValue({code:''});
        }
        this.loadData(nextProps.coin.coin_id);
    }
    async loadData(coinId){
        let res = await Http.post(config.api.getUserWithdrawAccountByCoinId,{coinId:coinId});
        this.setState({address:res.data});

        let assetsList = await Http.post(config.api.getUserAssets);
        if(assetsList.code!==1){
            message.error(lang.get(assetsList.msg));
            return;
        }
        let assets = assetsList.data.find((item)=>{
            return parseInt(item.coin_id,10) === parseInt(coinId,10)
        });
        this.setState({
            assetsList:assetsList.data,
            assets:assets
        })
    }
    validator_safePass(rule,value,callback){
        if(!value){
            callback(lang.get('请输入资金密码'));
        }
        else if(value && Utils.getPassLevel(value)){
            callback();
        }else{
            callback(lang.get('资金密码格式错误'));
        }
    }

    validator_code(rule,value,callback){
        if(!value){
            callback(lang.get('请输入验证码'));
        }
        else if(value && value.length===6 ){
            callback();
        }else{
            callback(lang.get('验证码格式错误'));
        }
    }

    validator_blockAddress(rule,value,callback){
        console.log(value);
        if(!value){
            callback(lang.get('请输入地址'));
        }
        else if(value && value.length>20 ){
            callback();
        }else{
            callback(lang.get('地址输入错误'));
        }
    }

    validator_amount(rule,value,callback){
        let coin = this.props.coin;

        if(!value){
            callback(lang.get('请输入提现数量'));
        }else if(!Utils.isNum(value)){
            callback(lang.get('格式错误'));
        }else if(parseFloat(value) > parseFloat(coin.withdraw_max_amount)){
            callback(lang.get('提现数量不能大于最大提现数量:') + coin.withdraw_max_amount);
        }else if(parseFloat(value) < parseFloat(coin.withdraw_min_amount)){
            callback(lang.get('提现数量不能小于最小提现数量:')+ coin.withdraw_min_amount);
        }else if(parseFloat(value) > parseFloat(this.state.assets.available)){
            callback(lang.get('提现数量不能大于可提现数量:')+ this.state.assets.available);
        }
        else{
            let newVal = Utils.checkDecimal(value,this.props.coin.decimal_digits);
            this.props.form.setFieldsValue({submitAmount:newVal});
            callback();
        }
    }

    async event_getOldCode(type, e) {
        let params = {};

        if (type === "phone") {
            params.type = "phone";
            params.areaCode = this.userInfo.area_code;
            params.phoneNumber = this.userInfo.phone_number;
        } else {
            params.type = "email";
            params.email = this.userInfo.email;
        }

        let res = await Http.post(config.api.sendCode, params);

        this.setState({ oldIsDisabled: true })
        if (res.code === 1) {
            message.success(lang.get('验证码发送成功'), 2);
            let timer = 60;
            this.setState({ oldCodeText: timer + 's' })

            this.oldTimer = setInterval(function () {
                if (timer - 1 < 0) {
                    clearInterval(this.oldTimer);
                    this.setState({
                        oldCodeText: lang.get('获取验证码'),
                        oldIsDisabled: false,
                    })

                } else {
                    timer--;
                    this.setState({
                        oldCodeText: timer + 's',
                    })
                }
            }.bind(this), 1000)

        } else {
            message.error(lang.get(res.msg), 2);
            this.setState({ oldIsDisabled: false })
        }
    }

    async event_submit(){
 
        let form = this.props.form;

        form.validateFields(async (err, values) => {

            if (err) {
                return;
            }

            global.WebApp.loading.show();

            let params = {
                coinId:this.props.coin.coin_id,
                toBlockAddress:values.toBlockAddress,
                submitAmount:values.submitAmount,
                safePass:values.safePass,
                googleCode:values.googleCode
            };

            if(this.codeType === "email"){
                params.emailCode = values.code;
            }else{
                params.phoneCode = values.code;
            }

            let res = await Http.post(config.api.doUserWithdraw,params);

            if (res.code!==1) {
                message.error(lang.get(res.msg));
                global.WebApp.loading.hide();
                return 
                
            }
            
            global.WebApp.loading.hide();
            message.success(lang.get(res.msg));

            this.props.form.setFieldsValue({toBlockAddress:''});
            this.props.form.setFieldsValue({submitAmount:''});
            this.props.form.setFieldsValue({safePass:''});
            this.props.form.setFieldsValue({googleCode:''});
            this.props.form.setFieldsValue({code:''});

            this.props.submit(res);
        })
    }
    renderOption(item) {
        return (
          <AutoComplete.Option key={item.block_address} text={item.block_address}>
            <span>[{item.memo}]--</span>
            <span>{item.block_address}</span>
          </AutoComplete.Option>
        );
      }

    render(){
        
        return  <Form className="m_form" style={{marginTop:"40px"}}>

            <Form.Item
                {...formItemLayout}
                label={<span>{lang.get('钱包地址')}</span>}
                colon={false}
            >
                {this.props.form.getFieldDecorator('toBlockAddress',
                    {rules:[{validator:this.validator_blockAddress.bind(this)}]}
                )(<AutoComplete 
                    size="large" 
                    maxLength={30}  
                    placeholder={lang.get('钱包地址')}
                    optionLabelProp="text"
                    dataSource={this.state.address.map(this.renderOption.bind(this))}
                />)}
                <Link to={'/assets/Account/' + this.props.coin.coin_id}>{lang.get('管理钱包地址')}</Link>
            </Form.Item>
            
            
            <Form.Item
                {...formItemLayout}
                label={<span>{lang.get('提现数量')}</span>}
                colon={false}
            >
                {this.props.form.getFieldDecorator('submitAmount',
                    {rules:[{validator:this.validator_amount.bind(this)}]}
                )(<Input size="large" maxLength={30}  placeholder={lang.get('提现数量')} />)}  
                <label className='tip'>
                    {lang.get('可提现数量:')+ ' ' + this.state.assets.available + ' ' + lang.get('手续费率:') + ' ' + 100 * this.props.coin.withdraw_fees_rate + '% ' + lang.get('单笔最小数量:') + ' ' + this.props.coin.withdraw_min_amount }
                </label>
            </Form.Item>

            <Form.Item
                {...formItemLayout}
                label={<span>{lang.get('资金密码')}</span>}
                colon={false}
            >
                {this.props.form.getFieldDecorator('safePass',
                    {rules:[{validator:this.validator_safePass.bind(this)}]}
                )(<Input type="password"  size="large" maxLength={30}  placeholder={lang.get('资金密码')} />)}    
            </Form.Item>
            
            <Form.Item {...formItemLayout} label={<span>{this.codeType === 'email' ? lang.get('邮箱验证码') : lang.get('手机验证码')}</span>} colon={false} key={2}>
                <Col span={16}>
                    {this.props.form.getFieldDecorator('code', {
                        rules: [{ validator: this.validator_code.bind(this) }]
                    })(
                        <Input size="large" style={{ width: "100%" }} maxLength={6} placeholder={this.codeType === 'email' ? lang.get('邮箱验证码') : lang.get('手机验证码')} />
                    )}
                </Col>
                <Col span={8}>
                    <Button disabled={this.state.oldIsDisabled} onClick={this.event_getOldCode.bind(this, this.codeType)} size="large" style={{ width: "93%", marginLeft: "10px", "padding": "0 10px" }} >{lang.get(this.state.oldCodeText)}</Button>
                </Col>
            </Form.Item>
            
            {!!this.userInfo.google_secret && <Form.Item
                {...formItemLayout}
                label={<span>{lang.get('Google 验证码')}</span>}
                colon={false}
            >
                {this.props.form.getFieldDecorator('googleCode',
                    {rules:[{validator:this.validator_code.bind(this)}]}
                )(<Input size="large" maxLength={30}  placeholder={lang.get('Google 验证码')} />)}
                
            </Form.Item> }

            <Form.Item
                {...formItemLayout}
                label={<span></span>}
                colon={false}
                style={{textAlign:'center'}}
            >

                <Button  onClick={this.event_submit.bind(this)} size="large" type="primary" htmlType="submit"   style={{width:"100%",color:'#fff'}} >{lang.get('确认')}</Button>
                
            </Form.Item>

        </Form>
    } 
}

export default Form.create()(FormBox);