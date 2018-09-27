import React from 'react';
import { Route, Switch } from 'react-router-dom'
import Loadable from 'react-loadable';
import LoadPage from '../../Page/Element/LoadPage';
import '../../assets/Less/news.less'

let NewsListPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Doc/NewsListPage" */ './newsList'),loading: LoadPage, delay:300,timeout:5000});
let NewsDetailPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Doc/NewsDetailPage" */ './newsDetail'),loading: LoadPage, delay:300,timeout:5000});
let ArticlePage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Doc/ArticlePage" */ './article'),loading: LoadPage, delay:300,timeout:5000});

export default class Doc extends React.Component{

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){

    }

    render(){
        return (
            <Switch>
                <Route component={NewsListPage} path="/doc/newsList/:typeId"/>
                <Route component={NewsDetailPage} path="/doc/newsDetail/:id"/>
                <Route component={ArticlePage} path="/doc/article/:id"/>
            </Switch>
        )
    }
}