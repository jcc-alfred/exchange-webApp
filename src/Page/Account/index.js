import React from 'react';
import { Route, Switch ,Redirect } from 'react-router-dom'
import Sidebar from './Sidebar';

import {SafeSettingPage,SetLoginPassPage,PhoneModifyPage,EmailModifyPage,GoogleAuthPage,SafePassPage,SafeKYCPage,SafeResetPassPage} from './SafeSetting'
import { StrategyPage } from './SafeStrategy';
import { SafeLogsPage } from './SafeLogs';
import { AlertSettingPage } from './AlertSetting';

import '../../assets/Less/person.less';

export default class Account extends React.Component{

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){

    }

    render(){
        return (
            <div className="container">
                <div className="person_box">
                    <Sidebar {...this.props} />
                    <Switch>
                        <Route  component={AlertSettingPage} path="/account/alertsetting"/>
                        <Route  component={SafeLogsPage} path="/account/safelogs"/>
                        <Route  component={StrategyPage} path="/account/strategy"/>

                        <Route  component={SafeKYCPage} path="/account/SafeSetting/safeKYC" />
                        <Route  component={GoogleAuthPage} path="/account/SafeSetting/GoogleAuth" />
                        <Route  component={PhoneModifyPage} path="/account/SafeSetting/PhoneModify" />
                        <Route  component={EmailModifyPage} path="/account/SafeSetting/EmailModify" />
                        <Route  component={SetLoginPassPage} path="/account/SafeSetting/SetLoginPass" />
                        <Route  component={SafePassPage} path="/account/SafeSetting/SafePassPage" />
                        <Route  component={SafeResetPassPage} path="/account/SafeSetting/SafeResetPass" />
                        <Route  component={SafeSettingPage} path="/account/SafeSetting" />
                        <Redirect to="/account/safeSetting" />
                    </Switch>
                </div>
            </div>
        )
    }
}