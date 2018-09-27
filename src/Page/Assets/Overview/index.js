import React from 'react';
import { Http, config ,Store, Utils} from '../../../Base'
import {Table,message,Button,Modal,Form,Input} from 'antd'
import lang from '../../../Lang'

const formItemLayout = {
    labelCol: {
        sm: { span: 6 },
    },
    wrapperCol: {
        sm: { span: 16 },
    },
};

class Overview extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            loading:false,
            data:[]
        }
        this.userInfo = Store.get(config.store.userInfo);
    }
    renderAction(text, row){

        let isCanDeposit =  row.is_enable_deposit ? true : false;
        let isCanWithdraw =  row.is_enable_withdraw && this.userInfo.is_enable_withdraw ? true : false;
        let isCanTransfer =  row.is_enable_transfer ? true : false;

        return <span>
            <Button onClick={this.toPage.bind(this,`/assets/Deposit/${row.coin_id}`)} disabled={!isCanDeposit}  style={isCanDeposit ? {fontSize:"12px",borderColor:"#40a9ff",color:"#40a9ff"} : {fontSize:"12px"}} size="small">{lang.get('充值')}</Button>&nbsp;&nbsp;
            <Button onClick={this.toPage.bind(this,`/assets/Withdraw/${row.coin_id}`)} disabled={!isCanWithdraw} style={isCanWithdraw ? {fontSize:"12px",borderColor:"#40a9ff",color:"#40a9ff"} : {fontSize:"12px"}} size="small">{lang.get('提现')}</Button>&nbsp;&nbsp;
            
        </span>
    }
    toPage(url,e){
        this.props.history.push(url);
    }

    componentDidMount(){
        this.load(1);
    }

    async load(page){
        global.WebApp.loading.show();
        let res = await Http.post(config.api.getUserAssets);
        global.WebApp.loading.hide();
        if(res.code===1){
            this.setState({data:res.data});
        }
        else{
            message.error(lang.get(res.msg));
        }
    }

    columns(){
        return  [
            {title:lang.get('币种'),dataIndex:'coin_name',key:'coin_name',align:'center',width:'20%'},
            {title:lang.get('可用'),dataIndex:'available',key:'available', render:(text)=>{return <div style={{float:'right'}}>{Utils.fixNumber(text,8)}</div>} ,align:'center',width:'25%'},
            {title:lang.get('冻结'),dataIndex:'frozen',key:'frozen',render:(text)=>{return <div style={{float:'right'}}>{Utils.fixNumber(text,8)}</div>},align:'center',width:'25%'},
            {title:lang.get('操作'),dataIndex:'comments',key:'comments',align:'center',width:'30%',render:this.renderAction.bind(this)}
        ]
    }
    render(){
        return  <div className="box_right">
            <div className="box_right_box">
                <div className="top_nav_box">
                    <div className="top_nav">
                        <div className="nav_item">
                            <div className="slider_box"></div>
                            <span className="nav_text">{lang.get('币币账户')}</span>
                        </div>
                    </div>
                </div>
                <div style={{marginTop:"30px"}}>
                    <Table
                        size='middle'
                        pagination={false}
                        dataSource={this.state.data} 
                        columns={this.columns()}
                        rowKey='coin_id'
                        bordered 
                    />
                </div>
            </div>
        </div>
    } 
}
export default Form.create()(Overview);