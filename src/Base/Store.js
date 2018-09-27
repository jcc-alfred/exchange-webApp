class Store{
    
    static expType = {
        session:'session',
        local:'local',
    }
    

    static setExp(exp){
       
        if(exp === this.expType.session || exp === this.expType.local){
            return exp   
        }
        else{
            return Date.now()/1000+exp;
        }
    }

    static isExp(exp){
        return Date.now()/1000 > exp
    }

    static set(key,val,exp=this.expType.session){

        let store = exp === this.expType.session ? sessionStorage : localStorage;
    
        let data = {
            data:val,
            exp:this.setExp(exp)
        };

        store.setItem(key,JSON.stringify(data))
    }

    static get(key){

        let data = sessionStorage.getItem(key) || localStorage.getItem(key);
        data = JSON.parse(data) || {};

        if(isFinite(data.exp)){
            if(this.isExp(data.exp)){
                this.remove(key)
                return null;
            }
        }
        return data.data;
    }
    static remove(key){

        sessionStorage.removeItem(key);
        localStorage.removeItem(key);

    }
    
    static sessionClear(){
        sessionStorage.clear()
    }

    static clear(type){
        sessionStorage.clear()
        localStorage.clear();
    }

}

export default Store;
