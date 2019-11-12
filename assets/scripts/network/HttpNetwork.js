import UtilTool from "../util/UtilTool";
import NativeHttp from "./NativeHttp";
import Global from "../game/data/Global";

export const LOGINTYPE = {
    wx: 0,
    qq: 1,
    oppo: 2,
    vivo: 3,
    native: 99,
}

window.HttpNetwork = {}

HttpNetwork.init = () => {
    MiniGame.getMiniPlatform();
}
/**
 * 切换服务器  版本管理
 * @param version
 * @returns {Promise<any>}
 */
HttpNetwork.checkoutVersion = (version) => {
    UtilTool.log(version)
    return new Promise((resolve, reject) => {
        HttpNetwork.httpRequest(NetUrlConfig.CHECKVERSION_URL, resolve, reject, {version: version})
    })
}

/**
 * 登录
 * @returns {Promise<any>}
 */
HttpNetwork.login = () => {
    UtilTool.log(MiniGame.loginType, 'MiniGame.loginType')
    UtilTool.log(cc.sys.platform, 'cc.sys.platform')
    return new Promise((resolve, reject) => {
        if (cc.sys.VIVO_GAME == cc.sys.platform) {
            qg.authorize({
                type: "code",
                success: function (obj) {
                    UtilTool.log('----------authorize----------')
                    UtilTool.jsonLog(obj)
                    var query = WxHttpSdk.enterQuery || {};
                    let inviterId = query.inviterId || query.equipmentFromUserId || null;
                    console.log("login  query  = " + JSON.stringify(query));
                    console.log("inviterId = " + inviterId);
                    WxHttpSdk.gameRequest(NetConfig.LOGIN_URL, resolve, reject, {
                        code: obj.code,
                        type: WxHttpSdk.loginType,
                        fromUserId: inviterId
                    })
                },
                fail: function (data, code) {
                }
            })
        } else if (cc.sys.isNative) {
            HttpNetwork.httpRequest(NetUrlConfig.LOGIN_URL, resolve, reject, {
                code: '243809a8a459ceaf105f015c83798924',
                type: 2,
                fromUserId: ''
            })
        } else if (cc.sys.platform != 2) {
            MiniGame.currentSys.login({
                success: (res) => {
                    UtilTool.log("res.code " + res.code);
                    var query = MiniGame.enterQuery || {};
                    let inviterId = query.inviterId || query.equipmentFromUserId || null;
                    console.log("login  query  = " + JSON.stringify(query));
                    console.log("inviterId = " + inviterId);
                    var data = res || res.data;
                    console.log("code = " + JSON.stringify(data));

                    if (cc.sys.platform = cc.sys.OPPO_GAME)
                        Global.initQGData(data)

                    let code = data.code || data.token;
                    HttpNetwork.httpRequest(NetUrlConfig.LOGIN_URL, resolve, reject, {
                        code: code,
                        type: MiniGame.loginType,
                        fromUserId: inviterId
                    })
                },

                fail: (res) => {
                    reject(res);
                }
            })
        }

    })
}


/**
 * http request
 * @param prams
 * @param resolve
 * @param reject
 * @param data
 * @param method
 */
HttpNetwork.httpRequest = (prams, resolve, reject, data, method = 'POST') => {
    let baseUrl = NetUrlConfig.isDebug ? NetUrlConfig.prodUrl : NetUrlConfig.betaUrl;
    baseUrl = baseUrl.replace(/^\s+|\s+$/g, "");
    let url = baseUrl + '/' + prams + "?time=" + Date.parse(new Date().toString());
    // let url = baseUrl + '/' + prams;
    UtilTool.log('prams  ' + prams + '   method  ' + method + "    data  " + JSON.stringify(data) + '  url= ' + url);
    if (cc.sys.isNative || cc.sys.platform == cc.sys.OPPO_GAME) {
        NativeHttp.send(url, resolve, reject, data, method)
    } else {
        MiniGame.httpRequest(url, resolve, reject, data, method)
    }
}