let apiDomain = 'http://54.169.107.53:3000/';

export default {
    mainDomain:'http://54.169.107.53:8888/',
    socketDomain: 'http://54.169.107.53:5000/',
    language:'zh-hk', //默认语言
    
    sys:{
        defaultSignUp:'email', // email | phone
        isUsePhoneSignUp:true,
        defaultSendCodeType:'email',
    },

    store:{
        token:'token',
        language:'language',//用户使用语言 local Store
        userInfo:'user_info',
        coin:"coin",
        refCode:'refcode'//推荐编码
    },


    api:{
        domain: apiDomain,
        logout: apiDomain + 'User/logout',
        imgCode: apiDomain + 'imgcode',
        sendCode:apiDomain + 'User/sendCode',
        signUp:apiDomain+ 'User/signUp',
        login:apiDomain+'User/login',
        authSafety:apiDomain+'User/authSafety',
        userInfo:apiDomain+'User/userInfo',
        modifyLoginPass:apiDomain + 'safe/modifyLoginPass',
        addAccount:apiDomain + 'safe/addAccount',
        modifyAccount:apiDomain + 'safe/modifyAccount',
        googleCode:apiDomain + 'safe/googleQRCode',
        addGoogleAuth: apiDomain + 'safe/addGoogleAuth',
        closeGoogleAuth: apiDomain + 'safe/closeGoogleAuth',
        addSafePass:apiDomain + 'safe/addSafePass',
        modifySafePass: apiDomain + 'safe/modifySafePass',
        addUserKYC: apiDomain + 'safe/addUserKYC',
        addUserSeniorKYC: apiDomain + 'safe/addUserSeniorKYC',
        upload:apiDomain + 'upload',
        strategySettings: apiDomain + 'safe/getUserSafeStrategySettings',
        setUserSafeStrategy: apiDomain + 'safe/setUserSafeStrategy',
        getUserLogs:apiDomain + 'safe/getUserLogs',
        getUserAlertSettings: apiDomain + 'safe/getUserAlertSettings',
        setUserAlert:apiDomain + 'safe/setUserAlert',
        forgotLoginPass:apiDomain + 'User/forgotLoginPass',
        forgotSafePass:apiDomain + 'User/forgotSafePass',


        getUserAssets:apiDomain + 'assets/getUserAssets',
        getCoinList:apiDomain+'exchange/getCoinList',
        getUserDepositListByCoinId:apiDomain + 'assets/getUserDepositListByCoinId',
        getUserAssetsLogTypeList :apiDomain +'assets/getUserAssetsLogTypeList',
        getUserAssetsLogList: apiDomain + 'assets/getUserAssetsLogList',
        getUserWithdrawAccountByCoinId:apiDomain + 'assets/getUserWithdrawAccountByCoinId',
        addUserWithdrawAccount:apiDomain + 'assets/addUserWithdrawAccount',
        delUserWithdrawAccount:apiDomain + 'assets/delUserWithdrawAccount',
        doUserWithdraw:apiDomain + 'assets/doUserWithdraw',
        getUserWithdrawListByCoinId:apiDomain + 'assets/getUserWithdrawListByCoinId',
        cancelUserWithdraw:apiDomain + 'assets/cancelUserWithdraw',
        getUserBonusStatics:apiDomain + 'assets/getUserBonusStatics',
        getUserBonusList:apiDomain + 'assets/getUserBonusList',

        getCoinExchangeList:apiDomain + 'exchange/getCoinExchangeList',
        getCoinExchangeAreaList:apiDomain + 'exchange/getCoinExchangeAreaList',
        getMarketList:apiDomain + 'exchange/getMarketList',
        getIsExchangeSafe:apiDomain + 'exchange/getIsExchangeSafe',
        doEntrust:apiDomain + 'exchange/doEntrust',
        doCancelEntrust:apiDomain + 'exchange/doCancelEntrust',
        
        getHomeNewsList : apiDomain + 'doc/getHomeNewsList',
        getNewsList : apiDomain + 'doc/getNewsList',
        getNewsModelById : apiDomain + 'doc/getNewsModelById',
        getArticleModelById : apiDomain + 'doc/getArticleModelById',

        uploadQrcode:apiDomain + 'uploadQrcode',
    },
}