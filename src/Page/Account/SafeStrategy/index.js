import Loadable from 'react-loadable';
import LoadPage from '../../Element/Loading';


export let StrategyPage = Loadable({ loader: () => import(/* webpackChunkName: "Page/Account/SafeStrategy" */ './Strategy'),loading: LoadPage, delay:300,timeout:5000});
