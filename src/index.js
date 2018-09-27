import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter /*BrowserRouter*/ as Router, Route,Switch ,Redirect } from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';
import { message } from 'antd';
import { Store ,config } from './Base'

import Loading from './Page/Element/Loading';
import Lang from './Lang';

import Header from './Page/Element/Header';
import Footer from './Page/Element/Footer';
import './assets/Less/main.less';

import { HomePage,LoginPage,SignUpPage, AccountPage ,ResetLoginPassPage,AssetsPage,ExchangePage,MarketPage,DocPage} from './Page';

global.WebApp = {}

class App extends React.Component{
    
    router = React.createRef();
    header = React.createRef();

    constructor(props){
        super(props);
        this.state = {
            languageName:false,
        }
        message.config({duration:1});
    }

    async componentDidMount(){
        await Lang.setLanguage();
    }

    auth(Layout, props){

        if (Store.get(config.store.token)) { // 未登录
            return <Layout {...props} />
        } else {
            return <Redirect to="/Login" />;
        }
    }
 
    render(){
        if(this.state.languageName){ 
            return (
                <Router ref={this.router}>
                    <div className={window.location.href.toLowerCase().indexOf('/market') <= 0 ? "wrap" : "wrap currencyTran"}>
                        <Loading ref={(el)=>{ global.WebApp.loading = el }} />
                        <Header ref={(el)=>{ global.WebApp.header = el }} />
                        <Switch>
                            <Route  exact path="/" component={HomePage} />
                            <Route strict path="/Login"  component={LoginPage} />
                            {/* <Route strict path="/SignUp"  component={SignUpPage} /> */}
                            <Route strict component={SignUpPage} path="/SignUp/:refcode"/>
                            <Route  component={SignUpPage} path="/SignUp"/>

                            <Route  component={DocPage} path="/Doc"/>

                            <Route strict path="/Account"  component={(props)=>this.auth(AccountPage,props)} />
                            <Route strict path="/ResetPass" component={ResetLoginPassPage}/>
                            <Route strict path="/Assets" component={(props)=>this.auth(AssetsPage,props)} />

                            <Route strict component={(props)=>this.auth(ExchangePage,props)} path="/Exchange/:id"/>
                            <Route path="/Exchange" component={(props)=>this.auth(ExchangePage,props)} />
                            <Route strict component={(props)=>this.auth(MarketPage,props)} path="/Market/:id"/>
                            <Route path="/Market" component={(props)=>this.auth(MarketPage,props)} />
                        </Switch>
                        {window.location.href.toLowerCase().indexOf('/market') <= 0 ?
                        <Footer ref={(el)=>{ global.WebApp.footer = el }}/> : ''
                        }
                    </div>
                </Router>
            )
        }else{
            return null;
        }
    }
}

ReactDOM.render(<App  ref={(el)=>{ global.WebApp.app = el }} />, document.getElementById('root'));
registerServiceWorker();


