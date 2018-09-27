import Loadable from 'react-loadable';
import LoadPage from '../../Element/Loading';

export let AlertSettingPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Account/SafeLogs" */ './AlertSetting'),loading: LoadPage, delay:300,timeout:5000});