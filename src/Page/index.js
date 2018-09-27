import Loadable from 'react-loadable';
import LoadPage from './Element/Loading';

export let HomePage = Loadable({ loader: () => import(/* webpackChunkName: "Page/HomePage" */ './Home'),loading: LoadPage, delay:300,timeout:5000});
export let LoginPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/HomePage" */ './Login'),loading: LoadPage, delay:300,timeout:5000});
export let SignUpPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/SignUpPage" */ './SignUp'),loading: LoadPage, delay:300,timeout:5000});
export let AccountPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/AccountPage" */ './Account'),loading: LoadPage, delay:300,timeout:5000});
export let ResetLoginPassPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/ResetLoginPassPage" */ './ResetLoginPass'),loading: LoadPage, delay:300,timeout:5000});
export let AssetsPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/AssetsPage" */ './Assets'),loading: LoadPage, delay:300,timeout:5000});
export let ExchangePage = Loadable({ loader: () => import(/* webpackChunkName: "Page/ExchangePage" */ './Exchange'),loading: LoadPage, delay:300,timeout:5000});
export let MarketPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/MarketPage" */ './Market'),loading: LoadPage, delay:300,timeout:5000});
export let DocPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/DocPage" */ './Doc'),loading: LoadPage, delay:300,timeout:5000});
