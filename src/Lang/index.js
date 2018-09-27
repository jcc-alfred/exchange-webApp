import { config,Store } from '../Base'

class Lang {

    constructor(){
        this.nations = ['zh-cn','zh-hk','en-us'];
        this.language = null;
        this.langName = null;
    }

    async setLanguage(langName){
        let storeLang = Store.get(config.store.language);
        let sysLang = navigator.language.toString().toLowerCase();
        if(langName && this.nations.includes(langName)){
            this.langName = langName;
        }
        else if(storeLang && this.nations.includes(storeLang)){
            this.langName = storeLang
        }
        else if(sysLang && sysLang.startsWith('en')){
            this.langName = 'en-us'
        }
        else{
            this.langName = this.nations.includes(sysLang) ? sysLang : config.language;
        }
  
        let languageModule = await import(/* webpackChunkName: "i18n/" */'./'+this.langName);
        this.language = languageModule.default;
    
        Store.set(config.store.language,this.langName,Store.expType.local);
        global.WebApp.app.setState({languageName:this.language})

        return this.langName;
    }
    getLanguage(){
        return this.langName;
    }
    get(key){
        return this.language[key] || key;
    }

}

export default new Lang()