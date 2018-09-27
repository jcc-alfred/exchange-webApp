import React from 'react';
import { Route, Switch ,Redirect } from 'react-router-dom'
import Loadable from 'react-loadable';
import LoadPage from '../../Page/Element/LoadPage';
import '../../assets/Less/assets.less';
import Sidebar from './Sidebar';

let OverviewPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Assets/OverviewPage" */ './Overview'),loading: LoadPage, delay:300,timeout:5000});
let DepositPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Assets/DepositPage" */ './Deposit'),loading: LoadPage, delay:300,timeout:5000});
let WithdrawPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Assets/WithdrawPage" */ './Withdraw'),loading: LoadPage, delay:300,timeout:5000});
let AccountPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Assets/AccountPage" */ './Account'),loading: LoadPage, delay:300,timeout:5000});
let BillPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Assets/BillPage" */ './Bill'),loading: LoadPage, delay:300,timeout:5000});
let PromotionPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Assets/PromotionPage" */ './Promotion'),loading: LoadPage, delay:300,timeout:5000});

export default class Assets extends React.Component{

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){

    }

    render(){
        return (
            <div className="container">
                <div className="assets_box">
                    <Sidebar {...this.props} />
                    <Switch>
                        <Route  component={OverviewPage} path="/assets/overview"/>
                        
                        <Route strict component={DepositPage} path="/assets/Deposit/:id"/>
                        <Route  component={DepositPage} path="/assets/Deposit/"/>

                        <Route strict component={WithdrawPage} path="/assets/Withdraw/:id"/>
                        <Route  component={WithdrawPage} path="/assets/Withdraw"/>

                        <Route strict component={AccountPage} path="/assets/Account/:id"/>
                        <Route  component={AccountPage} path="/assets/Account"/>

                        <Route  component={BillPage} path="/assets/Bill"/>
                        <Route  component={PromotionPage} path="/assets/Promotion"/>
                        <Redirect strict exact to="/assets/overview" />
                    </Switch>
                </div>
            </div>
        )
    }
}