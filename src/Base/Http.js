import Store from './Store';

const getAbort  = function(timeout){
    return new Promise(function(resolve, reject){
        setTimeout(()=>{
            resolve({error:true,status:408})
        },timeout)
    });
}
const getFetch = async (url,config,timeout)=>{
    let res =  await Promise.race([ fetch(url,config), getAbort(timeout)]);
    return res;
}


class Http {
    async request(url,type,data,timeout){

        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
     
        headers['token'] = Store.get('token')
        headers['language'] = Store.get('language');

        let config = {
            method: type,
            headers : headers,
            // mode: ' cors',
            credentials: "include",
            // cache: 'no-cache',
            body: (data ? JSON.stringify(data) : null),
        };
        try{
            let res = await getFetch(url,config,timeout);//fetch
            if(res.status ===401 || res.status === 403){
                Store.sessionClear();
                window.location.href = '/#/login';
                //window.location.reload();
                return {error:0,status:res.status,code:-1,msg:'请先登录'}
            }
            if(res.ok){
                return res.json()
            }else{
                return {error:true,status:res.status}
            }

        } catch (error) {
            return {error:true,msg:error};
        }
    }

    async get(url,param=null,timeout=5000){
    
        if(param){
            let queryString = this.queryString(param);
            url = url + ( url.indexOf('?')===-1 ? '?' : '&') + queryString
        }

        let data = await this.asyncLoop(1,async (i)=>{
            return await this.request(url,'GET',null,timeout)
        })
        return data;
    };

    async post(url,param,timeout=5000){
        return await this.asyncLoop(1,async (i)=>{
            return await this.request(url,'POST', param, timeout);
        });
    }

    async asyncLoop(num,fun){

        let i = 0;
        let next = async (i)=>{
            let res = await fun(i);
            i++
            if(res.error && i <num){
                return await next(i);
            }else{
                return res
            }
        }
        return await next(i);
    }

    queryString(obj){
        return Object.keys(obj).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&');
    }
    
}   
export default new Http();