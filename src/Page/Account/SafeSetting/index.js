import Loadable from 'react-loadable';
import LoadPage from '../../Element/Loading';

export let SafeSettingPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Account/HomePage" */ './SafeSetting'),loading: LoadPage, delay:300,timeout:5000});

export let SafeKYCPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Account/SafeKYC" */ './SafeKYC'),loading: LoadPage, delay:300,timeout:5000});
export let PhoneModifyPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Account/PhoneModify" */ './PhoneModify'),loading: LoadPage, delay:300,timeout:5000});
export let EmailModifyPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Account/EmailModify" */ './EmailModify'),loading: LoadPage, delay:300,timeout:5000});
export let GoogleAuthPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Account/GoogleAuth" */ './GoogleAuth'),loading: LoadPage, delay:300,timeout:5000});
export let SetLoginPassPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Account/SetLoginPass" */ './SetLoginPass'),loading: LoadPage, delay:300,timeout:5000});
export let SafePassPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Account/SafePass" */ './SafePass'),loading: LoadPage, delay:300,timeout:5000});

export let SafeResetPassPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Account/SafeResetPass" */ './SafeResetPass'),loading: LoadPage, delay:300,timeout:5000});
