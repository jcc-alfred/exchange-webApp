import React from 'react';
import { Http, config, Store, Utils } from '../../../Base'
import { message, Form, Input, Button, Col,Select , Upload,Row} from 'antd';
import lang from '../../../Lang'

const formItemLayout = {
    labelCol: {
        sm: { span: 8 },
    },
    wrapperCol: {
        sm: { span: 10 },
    },
};

class SafeKYC extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            areaList:[],
            oldIsDisabled:false,
            oldCodeText:lang.get('获取验证码'),
            areaName:'中国',
            areaCode:'86',
            lastName:'',
            firstName:'',
            validateStatus:'success',
            help:'',

            front:false,
            behond:false,
            hand:false,
            
        };
        this.userInfo = Store.get(config.store.userInfo);

        this.isHigh = [1,4].includes(this.userInfo.identity_status);

        this.codeType = Utils.getSendCodeType(this.userInfo);
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

    validator_lastName(e){
        let value = e.currentTarget.value;
        if(!value){
            this.setState({
                help:'请输入姓名',
                validateStatus:'error',
                lastName:e.currentTarget.value
                
            });
            return false;
        }else{
            this.setState({lastName:e.currentTarget.value,validateStatus:'success',help:''})
            return true;
        }
    }
    validator_firstName(e){
        let value = e.currentTarget.value;
        if(!value){
            this.setState({
                help:'请输入姓名',
                validateStatus:'error',
                firstName:e.currentTarget.value
            });
            return false;
        }else{
            this.setState({firstName:e.currentTarget.value,validateStatus:'success',help:''});
            return true;
        }
        
    }
    validator_cardId(rule,value,callback){
        if(!value){
            callback(lang.get('请输入证件号码'));
        }
        else if(value && this.state.areaCode==='86' && Utils.isChinaCardId(value)){
            callback();
        }else if(value && this.state.areaCode!=='86' && value.length >= 6){
            callback();
        }else{
            callback(lang.get('证件号码格式错误'));
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

    event_upload(type,info){
        const status = info.file.status;
        if (status !== 'uploading') {
            //console.log(info.file, info.fileList);
        }
        if (status === 'done') {
            
            let types = {};
            types[type] = config.api.domain + info.file.response.data
            this.setState(types)

            message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    }

    event_submit(e){
        e.preventDefault();

        let lastNameState = this.validator_firstName({currentTarget:{value:this.state.firstName}});
        let firstNameState = this.validator_lastName({currentTarget:{value:this.state.lastName}});
        if(!lastNameState || !firstNameState){
            this.setState({
                help:'请输入姓名',
                validateStatus:'error'
            })
        }

        this.props.form.validateFields(async (err, values) => {
          
            if (err || !lastNameState|| !firstNameState) {
                return;
            }

            global.WebApp.loading.show();

            let params = {};
            let res = {};
            if (this.isHigh) {
              
            } else {
                params.areaCode = this.state.areaCode;
                params.lastName = this.state.lastName;
                params.firstName = this.state.firstName;
                params.cardId = values.cardId;
                res =  await Http.post(config.api.addUserKYC,params);
            }


            global.WebApp.loading.hide();

            if (res.code===1) {
                message.success(lang.get('设置成功'));
                this.props.history.goBack()
            } else {
                message.error(lang.get(res.msg));
            }
        })
    }

    renderJunior(){
        return  <Form className="m_form" onSubmit={this.event_submit.bind(this)}>
            <Form.Item
                {...formItemLayout}
                label={<span>{lang.get('地区')}</span>}
                colon={false}
            >
              
                <Select
                    value={this.state.areaName}
                    showSearch dropdownMatchSelectWidth={false} 
                    dropdownStyle={{width:'331px'}} 
                    size="large" 
                    style={{borderColor:'#40a9ff'}}
                    defaultActiveFirstOption={false}
                    onSelect={(val,key)=>{
                        let [code,name] = val.split('-');
                        this.setState({areaName:name,areaCode:code});
                    }}
                >
                    {this.state.areaList.map((area,key)=>{
                        return <Select.Option key={key} value={area.code+'-'+area.name} >{area.name}</Select.Option>
                    })}
                </Select>
            </Form.Item>
                
            <Form.Item
                {...formItemLayout}
                label={<span>{lang.get('姓名')}</span>}
                colon={false}
                validateStatus={this.state.validateStatus}
                help={this.state.help}
            >
                <Input.Group compact>
                    <Col span={12}>
                        <Input  onChange={this.validator_lastName.bind(this)} value={this.state.lastName} size="large" maxLength={30}  placeholder={lang.get('姓')} />
                    </Col>
                    <Col span={12}>
                        <Input  onChange={this.validator_firstName.bind(this)} value={this.state.firstName} size="large" maxLength={30}  placeholder={lang.get('名')} />
                    </Col>
                </Input.Group>

            </Form.Item>

            <Form.Item
                {...formItemLayout}
                label={<span>{lang.get(this.state.areaCode==='86'?'身份证号':'护照号码')}</span>}
                colon={false}
            >
                {this.props.form.getFieldDecorator('cardId',
                    {rules:[{validator:this.validator_cardId.bind(this)}]}
                )(<Input size="large" maxLength={30}  placeholder={lang.get(this.state.areaCode==='86'?'身份证号':'护照号码')} />)}
                
            </Form.Item> 

            <Form.Item
                {...formItemLayout}
                label={<span></span>}
                colon={false}
                style={{ textAlign: 'center' }}
            >

                <Button size="large" type="primary" htmlType="submit" style={{ width: "100%", color: '#fff' }} >{lang.get('确认')}</Button>

            </Form.Item>
        </Form>
    }

    async event_highSub(e){
        if(!this.state.front || !this.state.hand){
            message.error(lang.get('请上传证件照'));
            return;
        }
        if(this.state.areaCode==='86' && !this.state.behond){
            message.error(lang.get('请上传证件照'));
            return;
        }
        global.WebApp.loading.show();
        let res = await Http.post(config.api.addUserSeniorKYC,{
            frontImage:this.state.front.replace(config.api.domain,''),
            handImage:this.state.hand.replace(config.api.domain,''),
            backImage:this.state.behond.replace(config.api.domain,''),
        })
        global.WebApp.loading.hide();
        if(res.code===1){
            message.success(lang.get('设置成功'));
            this.props.history.goBack()
        }else{
            message.error(lang.get(res.msg));
        }
    }

    renderHigh(){
        return <div>
            <Row>
                <Col span={8}>
                    <div style={{width:'264px',height:'148px',textAlign:"center"}}>
                        {!this.state.front && <Upload.Dragger 
                            action={config.api.upload}
                            name='file'
                            onChange={this.event_upload.bind(this,'front')}
                        >
                            <div className="photo_box_border">
                                <i className="icon_front"></i>
                            </div>
                        </Upload.Dragger>}
                        {this.state.front && <img style={{width:"100%",height:"100%"}} src={this.state.front} alt="" />}
                        <span style={{lineHeight:"40px",fontSize: "16px",fontWeight: "600"}}>{lang.get('证件正面照')}</span>
                    </div>
                </Col>
                <Col span={8}>
                    <div style={{width:'264px',height:'148px',textAlign:"center"}}>
                        {!this.state.behond && <Upload.Dragger 
                            action={config.api.upload}
                            name='file'
                            onChange={this.event_upload.bind(this,'behond')}
                            showUploadList={false}
                        >
                            <div className="photo_box_border">
                                <i className="icon_behond"></i>
                            </div>
                        </Upload.Dragger>}
                        {this.state.behond && <img style={{width:"100%",height:"100%"}} src={this.state.behond} alt="" />}
                        <span style={{lineHeight:"40px",fontSize: "16px",fontWeight: "600"}}>{lang.get('证件背面照')}</span>
                    </div>
                </Col>
                <Col span={8}>
                    <div style={{width:'264px',height:'148px',textAlign:"center"}}>
                        {!this.state.hand && <Upload.Dragger 
                            action={config.api.upload}
                            name='file'
                            onChange={this.event_upload.bind(this,'hand')}
                            showUploadList={false}
                        >
                            <div className="photo_box_border">
                                <i className="icon_hand"></i>
                            </div>
                        </Upload.Dragger>}
                        {this.state.hand && <img style={{width:"100%",height:"100%"}} src={this.state.hand} alt="" />}
                        <span style={{lineHeight:"40px",fontSize: "16px",fontWeight: "600"}}>{lang.get('手持证件照')}</span>
                    </div>
                </Col>
            </Row>
            <div style={{marginTop:"70px",textAlign:'center'} }>
                <Button type="primary"  onClick={this.event_highSub.bind(this)}  size="large" style={{width:"300px"}}>{lang.get('提交')}</Button>
            </div>
        </div>
    }

    async componentDidMount(){
        let areaList = await import(/* webpackChunkName: "Base/area_code" */ '../../../Base/area_code');
        this.setState({areaList:areaList.default});
    }

    render() {
        return <div className="box_right">
            <div className="box_right_box">
                <div className="header_title">
                    <div className="line_div">
                        <div className="slider_fang"></div>
                        <div className="up_text"><span>{lang.get('身份认证')}</span></div>
                    </div>
                </div>
                <div className="right_form">
                    {this.isHigh ? this.renderHigh() : this.renderJunior()}
                </div>
            </div>
        </div>
    }
    componentWillUnmount(){
        clearInterval(this.newTimer);
        clearInterval(this.oldTimer);
    }
}

export default Form.create()(SafeKYC);