import Loadable from 'react-loadable';
import LoadPage from '../../Element/Loading';

export let SafeLogsPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Account/SafeLogs" */ './SafeLogs'),loading: LoadPage, delay:300,timeout:5000});