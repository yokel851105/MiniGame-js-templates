/**
 * mini game
 * @type {{}}
 */
import UtilTool from "../util/UtilTool";
import Config from "../tabel/Config";
import {LOGINTYPE} from "./HttpNetwork";
import AttributeData from "../game/main/data/AttributeData";

window.MiniGame = {
    gameClub: null,
    authBtn: null,
    openSettingButton: null,
    feedbackBtn: null,
    intervalTimer: null,
    isSignShare: false,
    enterQuery: null,
    helpType: '',
    bannerAd: null,
    videoAd: null,
    currentSys: '',
    loginType: 0,                //微信平台 0 qq 1  现在wx qq 导出的都是WX的wechatgame  这里需要手都改下
    oppoAppId: '',                 //oppo 平台的appID
}


MiniGame.getMiniPlatform = () => {
    UtilTool.jsonLog(window['qq'], ' window[qq] ')
    UtilTool.jsonLog(window['wx'], ' window[MiniGame.currentSys] ')
    UtilTool.jsonLog(window['qg'], ' window[qg] ')
    UtilTool.jsonLog(window['isBrowser'], ' window[isBrowser] ')
    if (cc.sys.WECHAT_GAME == cc.sys.platform) {
        UtilTool.log('wx or qq')
        if (MiniGame.loginType) {
            MiniGame.loginType = LOGINTYPE.qq;
            MiniGame.currentSys = qq;
        } else {
            MiniGame.loginType = LOGINTYPE.wx;
            MiniGame.currentSys = wx;
        }
    } else if (cc.sys.OPPO_GAME == cc.sys.platform) {
        UtilTool.log('qg')
        MiniGame.loginType = LOGINTYPE.oppo;
        MiniGame.currentSys = qg;
    } else if (cc.sys.VIVO_GAME == cc.sys.platform) {
        UtilTool.log('qg')
        MiniGame.loginType = LOGINTYPE.vivo;
        MiniGame.currentSys = qg;
    } else {
        UtilTool.log('app')
        MiniGame.loginType = LOGINTYPE.native;
        MiniGame.currentSys = '';
    }
    // MiniGame.currentSys = window['qq'] || window['wx'] || window['qg'];
    if (!MiniGame.currentSys) {
        console.log('未获取正确的MiniGame');
        return;
    }

    return MiniGame.currentSys;
}


/**
 * vivo minigame
 */
MiniGame.authorize = () => {
    qg.authorize({
        type: "token",
        success: function (obj) {
            UtilTool.log('----------getProfile-----token-----')
            UtilTool.jsonLog(obj)
            qg.getProfile({
                token: obj.accessToken,
                success: function (data) {
                    UtilTool.log('----------getProfile----getProfile------')
                    UtilTool.jsonLog(data)
                    GlobalVar.initVivoData(data);
                    GlobalVar.isAuthed = true;
                    // GameEvent.instance().dispatchCustomEvent(EventName.EName.STARTGAME, {startGame: true});

                },
                fail: function (data, code) {
                    GlobalVar.isAuthed = false;
                    // GameEvent.instance().dispatchCustomEvent(EventName.EName.STARTGAME, {startGame: true});
                }
            })
        },
        fail: function (data, code) {
            GlobalVar.isAuthed = false;
            // GameEvent.instance().dispatchCustomEvent(EventName.EName.STARTGAME, {startGame: true});
        }
    })
}


MiniGame.updataVersion = () => {
    if (cc.sys.WECHAT_GAME == cc.sys.platform) {
        const updateManager = wx.getUpdateManager();
        updateManager.onUpdateReady(function () {
            updateManager.applyUpdate();
        });

    } else if (cc.sys.OPPO_GAME == cc.sys.platform) {

    } else if (cc.sys.VIVO_GAME == cc.sys.platform) {
        qg.onUpdateReady(function (res) {
            // qg.showToast({
            //     message: '' + res
            // });
            if (res == 1) {
                qg.applyUpdate();
            }
        });
    }

}

//获取启动小游戏时候的初始化数据
MiniGame.getShowData = () => {
    if (!cc.sys.isNative && !cc.sys.isBrowser) {
        MiniGame.getMiniPlatform();
        MiniGame.getQueryOptions();
        MiniGame.initAdService();
        MiniGame.judgeNet();
        MiniGame.onMenuShare();   //转发
        MiniGame.onShow();
        MiniGame.onHide();
        MiniGame.setKeepScreenOn();
    } else {
        UtilTool.log('getShowData  app')
    }
}

/**
 * 获取授权
 */
MiniGame.getSetting = () => {
    UtilTool.log("用户已授权 1111");
    if (cc.sys.VIVO_GAME == cc.sys.platform) {
        MiniGame.authorize();
        return;
    }
    MiniGame.currentSys.getSetting({
        success: function (res) {
            var authSetting = res.authSetting
            if (authSetting['scope.userInfo'] === true) {
                // 用户已授权，可以直接调用相关 API
                UtilTool.log("用户已授权");
                MiniGame.getUserInfo();
            } else {
                // GameEvent.instance().dispatchCustomEvent(EventName.EName.STARTGAME, {startGame: true});
            }
        }
    })
}

MiniGame.createUserInfoBtn = () => {
    let systemInfo = MiniGame.currentSys.getSystemInfoSync();
    let width = systemInfo.windowWidth;
    let height = systemInfo.windowHeight;
    let button = MiniGame.currentSys.createUserInfoButton({
        type: 'text',
        text: '测试',
        image: "shezhi.png",
        style: {
            left: 0,
            top: 0,
            width: width,
            height: height,
            lineHeight: 40,
            backgroundColor: '#00000000',
            color: '#00000000',
            textAlign: 'center',
            fontSize: 16,
            borderRadius: 4
        }
    })

    button.onTap((res) => {

        console.log('createUserInfoBtn ' + JSON.stringify(res))

        if (res.rawData) {
            let userInfo = res.userInfo;
            GlobalVar.initData(userInfo);
            // GameEvent.instance().dispatchCustomEvent(EventName.EName.STARTGAME, {startGame: true});
            button.hide();
            button.destroy();

        }

    })
},

    /**
     * 获取授权
     */
    MiniGame.getUserInfo = () => {
        MiniGame.currentSys.getUserInfo({
            success: (res) => {
                console.log('getUserInfo', JSON.stringify(res))
                let userInfo = res.userInfo;
                GlobalVar.initData(userInfo);
                // GameEvent.instance().dispatchCustomEvent(EventName.EName.STARTGAME, {startGame: true});

                if (res.errMsg.indexOf('auth deny') > -1 || res.errMsg.indexOf('auth denied') > -1) {
                    // 处理用户拒绝授权的情况
                }
                // console.log('getUserInfo  fail  ', JSON.stringify(res))
            },
            complete: (res) => {
                // console.log('getUserInfo  complete  ', JSON.stringify(res))
                // GameEvent.instance().dispatchCustomEvent(EventName.EName.STARTGAME, {startGame: true});
            }
        });

    }


/**
 * 打开设置页面
 */
MiniGame.openSettingUi = () => {
    let button = MiniGame.currentSys.createOpenSettingButton({
        type: 'text',
        text: '打开设置页面',
        style: {
            left: 10,
            top: 76,
            width: 200,
            height: 40,
            lineHeight: 40,
            backgroundColor: '#ff0000',
            color: '#ffffff',
            textAlign: 'center',
            fontSize: 16,
            borderRadius: 4
        }
    })
}

/**
 * 显示 loading 提示框
 * @param title    提示的内容
 */
MiniGame.showLoading = (title = '') => {
    if (cc.sys.OPPO_GAME == cc.sys.platform) return;
    if (cc.sys.VIVO_GAME == cc.sys.platform) {
        WxHttpSdk.currentSys.showLoading({
            message: title,
        })
    } else {
        MiniGame.currentSys.showLoading({
            title: title,
            mask: true,
        })
    }

    setTimeout(() => {
        MiniGame.currentSys.hideLoading();
    }, 5000);
}


MiniGame.hideLoading = () => {
    MiniGame.currentSys.hideLoading();
}


MiniGame.showNoMaskLoading = () => {
    // GameEvent.instance().dispatchCustomEvent(EventName.EName.MASKNODE, {isShow: true});
    setTimeout(() => {
        MiniGame.hideNoMaskLoading();
    }, 10000);
}


MiniGame.hideNoMaskLoading = () => {
    // GameEvent.instance().dispatchCustomEvent(EventName.EName.MASKNODE, {isShow: false});
}


MiniGame.showDisableTouch = (isTouch = true) => {
    // GameEvent.instance().dispatchCustomEvent(EventName.EName.DISABLEROUCH, {isShow: isTouch});
}


/**
 * 向开放域存数据
 * @param {*} key
 * @param {*} value
 */

MiniGame.setUserCloudStorage = (myKey, value) => {
    MiniGame.currentSys.setUserCloudStorage({
        KVDataList: [{key: myKey, value: '' + value}],
        success: (res) => {
            UtilTool.log('向开放域存数据  ' + myKey + '     ' + value);
        },
        fail: (res) => {
            UtilTool.log(res);
        }
    })
}


MiniGame.setStorage = (key, val) => {
    MiniGame.currentSys.setStorage({
        key,
        data: val,
    })
}


MiniGame.getStorage = (key, succ_cb = null) => {
    MiniGame.currentSys.getStorage({
        key,
        success(res) {
            if (succ_cb) succ_cb(res.data)
        }
    })
}


// 创建授权按钮
MiniGame.createAuthBtn = (style = null) => {
    if (GlobalVar.isAuthed) {
        return;
    }
    ;

    if (!MiniGame.authBtn && style) {
        MiniGame.authBtn = MiniGame.currentSys.createUserInfoButton({
            type: 'text',
            text: '',
            image: "shezhi.png",
            style: style,
        });

        MiniGame.authBtn.onTap((res) => {
            console.log('createUserInfoBtn ' + JSON.stringify(res))
            // MiniGame.getUserInfo();
            if (res.rawData) {
                let userInfo = res.userInfo;
                GlobalVar.initData(userInfo);
                // MiniGame.authBtn.hide();
                MiniGame.authBtn.destroy();
            }

        })
    }
    ;

    if (MiniGame.authBtn) MiniGame.authBtn.show();
}
    ,
// 隐藏授权按钮
    MiniGame.hideAuthBtn = () => {
        if (GlobalVar.isAuthed) {
            return;
        }
        ;
        if (MiniGame.authBtn != null) {
            MiniGame.authBtn.hide();
        }
        ;
    }


/**
 * 创建朋友圈
 */
MiniGame.createGameClub = (style = null) => {
    //qq版本没有游戏圈
    if (MiniGame.loginType) return;
    if (!MiniGame.gameClub && style) {
        MiniGame.gameClub = MiniGame.currentSys.createGameClubButton({
            // type: "image",
            // icon: 'green',
            type: 'text',
            text: '',

            style: style,
            // {
            //     left: 80,
            //     top: 150,
            //     width: 40,
            //     height: 40
            // }
        })
    }

    if (MiniGame.gameClub) MiniGame.gameClub.show();
    //
}


/**
 * 隐藏游戏圈
 */
MiniGame.destroyGameCLub = () => {
    if (MiniGame.gameClub != null) {
        // WxHttpSdk.gameClub.destroy();
        if (MiniGame.loginType) return;
        WxHttpSdk.gameClub.hide();
    }
    if (MiniGame.authBtn != null) {
        // WxHttpSdk.authBtn.destroy();
        MiniGame.authBtn.hide();
    }
}


MiniGame.showGameClubAndAuthBtn = () => {
    if (MiniGame.gameClub) {
        if (MiniGame.loginType) return;
        MiniGame.gameClub.show()
    }
    if (MiniGame.authBtn) {
        MiniGame.authBtn.show()
    }
}


//发信息到开放域

MiniGame.postMessage = (obj) => {
    MiniGame.currentSys.postMessage(obj);
}


/**
 * 播放视频
 */
MiniGame.createVideo = () => {
    let Video = MiniGame.currentSys.createVideo({
        x: 100,
        y: 100,
        controls: false,
        src: 'http://mp4.vjshi.com/2018-09-19/28940ba2ea06a0ed53aa21a7f0fa7533.mp4',
        poster: '',
        muted: true
    });
    Video.play();
    Video.requestFullScreen().then((res) => {

    }).catch(() => {

    })
}

/**
 * 获取getQueryOptions   启动下游戏获取信息
 */
MiniGame.getQueryOptions = () => {
    let data = MiniGame.currentSys.getLaunchOptionsSync();
    // MiniGame.onlineStatus(1);
    // UtilTool.log("getLaunchOptionsSync res " + JSON.stringify(data))
    MiniGame.enterQuery = data.query
}
/**
 * 打开小游戏   监听小游戏回到前台的事件
 */
MiniGame.onShow = () => {
    let _self = MiniGame;
    if (cc.sys.VIVO_GAME == cc.sys.platform) return;
    MiniGame.currentSys.onShow((res) => {
        UtilTool.log("MiniGame.currentSys.onShow res " + JSON.stringify(res));
        _self.judgeNet();
        _self.enterQuery = res.query
    });

    if (cc.sys.WECHAT_GAME == cc.sys.platform)
        MiniGame.releaseMemory();
}


MiniGame.onHide = () => {
    cc.sys.garbageCollect();
    MiniGame.currentSys.onHide(() => {
        UtilTool.log('onHide');
    });
}


MiniGame.releaseMemory = () => {
    const version = MiniGame.currentSys.getSystemInfoSync().SDKVersion

    if (MiniGame.compareVersion(version, '2.0.2') >= 0) {
        MiniGame.currentSys.onMemoryWarning(res => {
            console.log('onMemory  WarningReceive')
            MiniGame.triggerGC();
        })
    } else {
        // 如果希望用户在最新版本的客户端上体验您的小程序
        MiniGame.currentSys.showModal({
            title: '提示',
            content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
    }
}


//版本验证
MiniGame.compareVersion = (v1, v2) => {
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }

    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i])
        const num2 = parseInt(v2[i])

        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }
    return 0
}

MiniGame.showShareTips = () => {
    MiniGame.currentSys.showModal({
        title: '提示',
        showCancel: false,
        content: '分享失败无法获取奖励，请重试!',
        success: (res) => {
            if (res.cancel) {
                MiniGame.currentSys.hideToast();
            }
        }
    })
}


//判断网络的情况
MiniGame.judgeNet = () => {
    MiniGame.getNetworkType().then((res) => {
        UtilTool.jsonLog(res);
        if (res.networkType === 'none' || res.networkType === 'unknown') {
            MiniGame.netError();
        } else {
            MiniGame.currentSys.hideToast();
        }
    }).catch(() => {
        MiniGame.netError();
    })
}


MiniGame.netError = () => {
    MiniGame.showModal(MiniGame.judgeNet.bind(this), Language.netTip, Language.netText, '', Language.reTry);
}


/**
 * 打开同一公众号下关联的另一个小程序
 */
MiniGame.navigateToMiniProgram = (appId) => {
    MiniGame.currentSys.navigateToMiniProgram({appId: appId, envVersion: 'release'});
}


//右上角转发菜单
MiniGame.onMenuShare = () => {
    MiniGame.currentSys.showShareMenu(true);   //转发菜单
    // let shareJson = yxmp.asset.getShareMessage();
    let shareData = Config.ShareData[UtilTool.getRandomInt(0, 3)];
    let title = shareData.title;
    let imageUrl = Config.shareImageUrl + shareData.imageUrl;
    var query = "title=" + title + "&imageUrl=" + imageUrl;

    let shareCb = () => {
        return {
            title: title,
            imageUrl: imageUrl,
            query: query
        }
    }
    if (UtilTool.isPrint) {
        MiniGame.currentSys.onShareAppMessage(shareCb)
    } else {
        MiniGame.currentSys.aldOnShareAppMessage(shareCb);
    }

}


MiniGame.shareAppMessage = (helpType, success = null) => {
    let title = '';
    let imageUrl = '';
    let queryStr = '&helpType =' + helpType;
    MiniGame.helpType = helpType;
    let shareData = Config.ShareData[UtilTool.getRandomInt(0, 3)];
    switch (MiniGame.helpType) {
        case CAT_ANI_TAB.SHARER_GET_ITEM:
            //转盘
            shareData = Config.ShareData[2];
            break;
        case CAT_ANI_TAB.SHARERDOUBLEREWARD:
            shareData = Config.ShareData[2];
            break;
    }

    title = shareData.title;
    imageUrl = Config.shareImageUrl + shareData.imageUrl;
    //

    // UtilTool.log("    getShareMessage   " + JSON.stringify(shareJson))
    // UtilTool.log("queryStr  " + queryStr);
    MiniGame.isSignShare = false;

    let shareObj = {
        title: title, imageUrl: imageUrl, query: queryStr, success: (res) => {
            UtilTool.log("shareAppMessage  " + JSON.stringify(res));
            success(res);
        }
    };
    if (UtilTool.isPrint) {
        MiniGame.currentSys.shareAppMessage(shareObj)
    } else {
        MiniGame.currentSys.aldShareAppMessage(shareObj);
    }


}


MiniGame.share = (query, success = null) => {
    let shareData = Config.ShareData[UtilTool.getRandomInt(0, 2)];
    let title = shareData.title;
    let imageUrl = Config.shareImageUrl + shareData.imageUrl;


    let queryStr = MiniGame.stringifyQuery(query);
    MiniGame.isSignShare = false;

    let shareObj = {
        title: title, imageUrl: imageUrl, query: queryStr, success: (res) => {
            UtilTool.log("shareAppMessage  " + JSON.stringify(res));
            // success(res);
        }
    }
    if (UtilTool.isPrint) {
        MiniGame.currentSys.shareAppMessage(shareObj)
    } else {
        MiniGame.currentSys.aldShareAppMessage(shareObj);
    }
}

MiniGame.stringifyQuery = (query) => {
    var arr = []
    for (var p in query) {
        arr.push(p + '=' + query[p])
    }
    return arr.join('&')
}


/**
 * 发起 HTTPS 网络请求
 */
MiniGame.request = (prams, resolve, reject, data = {}, method = 'POST') => {
    let baseUrl = NetConfig.isDebug ? NetConfig.betaUrl : NetConfig.prodUrl;
    MiniGame.httpRequest(baseUrl, prams, resolve, reject, data, method);
}

MiniGame.gameRequest = (prams, resolve, reject, data = {}, method = 'POST') => {
    let baseUrl = NetConfig.isDebug ? NetConfig.loginUrl : NetConfig.loginProdUrl;
    MiniGame.httpRequest(baseUrl, prams, resolve, reject, data, method);

}


MiniGame.httpRequest = function (url, resolve, reject, data = {}, method = 'POST') {
    UtilTool.jsonLog(MiniGame.currentSys)
    UtilTool.jsonLog(data)
    wx.request({
        url: url,
        header: {
            uid: AttributeData.userId,
            token: AttributeData.accessToken,
            'content-type': 'application/json' // 默认值
        },
        method: 'POST',
        data: data,
        success: function (res) {
            UtilTool.jsonLog(res.data);
            if (res.data.code == -13) {
                MiniGame.hideNoMaskLoading();
            }
            else if (res.data.code == 1) {
                // UtilTool.jsonLog(' request error ' + JSON.stringify(res.data));
                // GameEvent.instance().dispatchCustomEvent(EventName.EName.SHOW_TIPS, {message: res.data.message});
                MiniGame.hideNoMaskLoading();
                resolve(res.data)
            } else if (res.data.code == 10) {
                // GameEvent.instance().dispatchCustomEvent(EventName.EName.SHOW_TIPS, {message: res.data.message});
                // res.data.code == 1  道具不足等等

                resolve(res.data)
                setTimeout(() => {
                    MiniGame.hideNoMaskLoading()
                    // GameEvent.instance().dispatchCustomEvent(EventName.EName.CONVERTVIEW, {});

                }, 500)


            } else if (res.data.code == 16) {
                // GameEvent.instance().dispatchCustomEvent(EventName.EName.SHOW_TIPS, {message: '勾玉不足'});
                MiniGame.hideNoMaskLoading();
            } else {
                resolve(res.data)
            }

        },
        fail: function (res) {
            // MiniGame.hideLoading();

            // GameEvent.instance().dispatchCustomEvent(EventName.EName.ERROR_TIPS, res);
            UtilTool.log("request  fail : " + JSON.stringify(res));
            reject(res);
            setTimeout(() => {
                MiniGame.hideNoMaskLoading()

            }, 2000)

        }
    })
}


/**
 * 定位的获取
 * @param cb
 * @returns {Promise}
 */
MiniGame.locationSetting = (cb) => {
    return new Promise((resolve, reject) => {
        MiniGame.currentSys.getSetting({
            success: function (res) {
                var authSetting = res.authSetting
                if (authSetting['scope.userLocation'] === false) {
                    // 用户已拒绝授权，再调用相关 API 或者 MiniGame.currentSys.authorize 会失败，需要引导用户到设置页面打开授权开关
                    UtilTool.log("用户已拒绝授权");
                    reject();
                } else {
                    UtilTool.log("用户已授权 else");
                    MiniGame.getLocation().then((res) => {
                        UtilTool.jsonLog(res)
                        resolve(res);
                    }).catch((res) => {
                        UtilTool.log(' MiniGame.getLocation  ' + JSON.stringify(res))
                        reject(res);
                    })
                }
            }
        })
    });


}

/**
 * 获取定位信息
 * @returns {Promise}
 */
MiniGame.getLocation = () => {
    return new Promise((resolve, reject) => {
        MiniGame.currentSys.getLocation({
            success: resolve,
            fail: reject
        })
    })
}


MiniGame.chooseLocation = () => {
    return new Promise((resolve, reject) => {
        MiniGame.currentSys.chooseLocation({
            success: resolve,
            fail: reject
        })
    })
}


/**
 * 创建打开设置的按钮
 */
MiniGame.createOpenSettingBtn = () => {
    let systemInfo = MiniGame.currentSys.getSystemInfoSync();
    let width = systemInfo.windowWidth;
    let height = systemInfo.windowHeight;
    MiniGame.openSettingButton = MiniGame.currentSys.createOpenSettingButton({
        type: 'image',
        text: '授权',
        image: "authorize.png",
        style: {
            left: (width * 0.5 - 100),
            top: (height * 0.5 + 15),
            width: 200,
            height: 60,
            lineHeight: 40,
            backgroundColor: '#ffffff',
            color: '#ffffff',
            textAlign: 'center',
            fontSize: 16,
            borderRadius: 4
        }
    })
}


/**
 *获取用户过去三十天微信运动步数，需要先调用 MiniGame.currentSys.login 接口。
 * scope.werun
 * 需要解密才能获得数据
 */
MiniGame.getWeRunData = () => {
    return new Promise((resolve, reject) => {
        MiniGame.currentSys.getWeRunData({
            success: resolve,
            fail: reject
        })
    })
}


/**
 * 分包加载
 * @param sceneName  分包场景的名称
 */
MiniGame.subpackage = (sceneName) => {
    let loadTask = MiniGame.currentSys.loadSubpackage({
        name: 'subpackage', // name 可以填 name 或者 root
        success: function (res) {
            // 分包加载成功后通过 success 回调
            console.log('load subpackage successfully.');
            // cc.director.loadScene(sceneName);
            // cc.director.getScene().addChild()
        },
        fail: function (res) {
            // 分包加载失败通过 fail 回调
            console.error(err);
        }
    })
    loadTask.onProgressUpdate(res => {
        console.log('下载进度', res.progress)
        console.log('已经下载的数据长度', res.totalBytesWritten)
        console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
    })
}


MiniGame.subpackageTest = (sceneName) => {
    let loadTask = MiniGame.currentSys.loadSubpackage({
        name: 'test', // name 可以填 name 或者 root
        success: function (res) {
            // 分包加载成功后通过 success 回调
            console.log('load test successfully.');
            // cc.director.getScene().addChild(cc.instantiate(sceneName))

        },
        fail: function (res) {
            // 分包加载失败通过 fail 回调
            console.error(err);
        }
    })
    loadTask.onProgressUpdate(res => {
        console.log('下载进度', res.progress)
        console.log('已经下载的数据长度', res.totalBytesWritten)
        console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
    })
}
    ,

    /**
     * 获取设备电量
     * Object res  level 1-100   isCharging
     */
    MiniGame.getBatteryInfo = () => {
        return new Promise((resolve, reject) => {
            MiniGame.currentSys.getBatteryInfo({
                success: resolve,
                fail: reject
            })
        })
    }

/**
 * 在 iOS 上不可用。
 *异步获取电量
 * @returns {*} BatteryInfo   res  level 1-100   isCharging
 */
MiniGame.getBatteryInfoSync = () => {
    return MiniGame.currentSys.getBatteryInfoSync();
}

/**
 *获取网络类型
 */
MiniGame.getNetworkType = () => {
    return new Promise((resolve, reject) => {
        MiniGame.currentSys.getNetworkType({
            success: resolve,
            fail: reject
        })
    })
}


/**
 * 监听网络状态变化事件
 * isConnected    boolean       当前是否有网络链接
 * networkType    string        网络类型
 *                              wifi    wifi 网络
 *                              2g    2g 网络
 *                              3g    3g 网络
 *                              4g    4g 网络
 *                              unknown    Android 下不常见的网络类型
 *                              none    无网络
 */

MiniGame.onNetworkStatusChange = () => {
    MiniGame.currentSys.onNetworkStatusChange(res => {

        let isConnected = res.isConnected;
        let networkType = res.networkType;
        console.log(isConnected)
        console.log(networkType)
        UtilTool.jsonLog(res);

        if (!isConnected || networkType != 'wifi' || networkType != '4g') {
            //提醒网络不好

            MiniGame.netError();
        }
    });
}

/**
 * 客服服务
 */
MiniGame.openCustomerServiceConversation = () => {
    MiniGame.currentSys.openCustomerServiceConversation({});
}


/**
 * 意见反馈按钮    根据默认按钮来设置这个按钮的位置大小
 */
MiniGame.createFeedbackButton = () => {
    MiniGame.feedbackBtn = MiniGame.currentSys.createFeedbackButton({
        type: "image",
        image: 'authorize.png',
        style: {
            left: 10,
            top: 76,
            width: 40,
            height: 40,
            lineHeight: 40,
            backgroundColor: '#ff0000',
            color: '#ffffff',
            textAlign: 'center',
            fontSize: 16,
            borderRadius: 4
        }
    });
    // MiniGame.feedbackBtn.show();
}


MiniGame.hideFeedbackBtn = () => {
    MiniGame.feedbackBtn.hide();
}

/**
 * 从本地相册选择图片或使用相机拍照。
 */
MiniGame.chooseImage = () => {
    MiniGame.currentSys.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
            // tempFilePath可以作为img标签的src属性显示图片
            const tempFilePaths = res.tempFilePaths
        }
    })
}

/**
 * 在新页面中全屏预览图片。预览的过程中用户可以进行保存图片、发送给朋友等操作。
 */
MiniGame.previewImage = (imgUrl = []) => {
    MiniGame.currentSys.previewImage({urls: imgUrl});
}

/**
 * 可以获取当前时间以微秒为单位的时间戳
 */

MiniGame.getCurrentTime = () => {
    return Performance.now();
}

MiniGame.addBannerAd = () => {
    if (cc.sys.platform == cc.sys.OPPO_GAME) {
        MiniGame.bannerAd = qg.createBannerAd({
            posId: '114309',
        })
        MiniGame.bannerAd.show();
        MiniGame.bannerAd.onHide(function () {
            console.log("banner 广告隐藏");
        })
        MiniGame.bannerAd.onShow(() => {
            console.log(" qg   banner 广告显示");
        })
        MiniGame.bannerAd.onError(err => {
            console.log(" qg   banner 广告显示  onError");
            UtilTool.jsonLog(err);
        })
        console.log(" qg   banner 广告显示   55");
        return;
    }else if(cc.sys.platform == cc.sys.VIVO_GAME){
        if (qg.getSystemInfoSync().platformVersionCode < 1031) {
            return;
        }
        // 广告
        if (this.bannerAd == null) {
            // 广告
            this.bannerAd = WxHttpSdk.currentSys.createBannerAd({
                posId: bannerAdunit[type],
                style: {}   //底部  不加 默认顶部
            })

            this.bannerAd.onError(function (res) {
                console.log(res);
            })

            this.bannerAd.onLoad(function () {
                console.log('Banner广告加载成功');
            })
        }
    }
    if (typeof (MiniGame.currentSys) !== "undefined") {
        // 手机屏幕信息

        let systemInfo = MiniGame.currentSys.getSystemInfoSync();
        MiniGame.windowWidth = systemInfo.windowWidth;
        MiniGame.windowHeight = systemInfo.windowHeight;
        MiniGame.pixelRatio = systemInfo.pixelRatio;
        console.log(MiniGame.windowWidth, MiniGame.windowHeight);
        let ratio = MiniGame.windowHeight / MiniGame.windowWidth;
        cc.log('屏幕的宽高比 ' + ratio);
        let topDelat = 0;
        if (ratio >= 2.0) {
            topDelat = (MiniGame.windowHeight - 667) / MiniGame.pixelRatio
        }

        // 广告
        if (MiniGame.bannerAd == null) {
            // 广告
            MiniGame.bannerAd = MiniGame.currentSys.createBannerAd({
                adUnitId: 'adunit-4d701604351e0af1',
                style: {
                    left: MiniGame.windowWidth / 2 - 150,
                    top: MiniGame.windowHeight - 90,
                    width: MiniGame.windowWidth * 0.9,
                }
            })
            MiniGame.bannerAd.onResize(() => {

                MiniGame.bannerAd.style.left = MiniGame.windowWidth * 0.1 / 2 + 0.1;
                MiniGame.bannerAd.style.top = MiniGame.windowHeight - MiniGame.bannerAd.style.realHeight - topDelat + 0.1;
            });
            MiniGame.bannerAd.onError(function (res) {
                console.log(res);
            })
        }
    }

}

MiniGame.showBannerAd = () => {
    MiniGame.addBannerAd();
    if (MiniGame.bannerAd)
        MiniGame.bannerAd.show();

}

MiniGame.hideBannerAd = () => {

    if (MiniGame.bannerAd == null) return;
    MiniGame.bannerAd.hide();
    // MiniGame.bannerAd.destroy()
    // MiniGame.bannerAd = null;
}

/**
 * 激励视频广告
 * @param cb  回调  视频是否结束 给予相应的奖励
 */
MiniGame.addRewardedVideoAd = (type, cb = null) => {
    // if (cb)
    //     cb("");
    // return;
    //满足条件后就不看视频广告
    MiniGame.showNoMaskLoading()
    Platform.gameReport(24)
    if (cc.sys.platform == cc.sys.OPPO_GAME) {
        MiniGame.addQGRewardedVideoAd(cb);
        return;
    }else if(cc.sys.platform == cc.sys.VIVO_GAME){
        MiniGame.addVivoRewardedVideoAd(type,cb);
        return;
    }
    if (MiniGame.videoAd == null) {
        MiniGame.videoAd = MiniGame.currentSys.createRewardedVideoAd({
            adUnitId: 'adunit-5317b8b254835418'
        })

        MiniGame.videoAd.load().then(() => {
            UtilTool.log("视频广告加载成功");
            MiniGame.videoAd.show()
        }).catch(err => {
            console.log(err.errMsg)
            MiniGame.videoAd.load().then(() => MiniGame.videoAd.show())
        })
    } else {
        // 用户触发广告后，显示激励视频广告
        MiniGame.videoAd.show().catch(() => {
            // 失败重试
            MiniGame.videoAd.load()
                .then(() => MiniGame.videoAd.show())
                .catch(err => {
                    console.log('激励视频 广告显示失败')
                })
        })
    }


    MiniGame.videoAd.onClose(res => {
        // 用户点击了【关闭广告】按钮
        // 小于 2.1.0 的基础库版本，res 是一个 undefined\

        if (res && res.isEnded || res === undefined) {
            // 正常播放结束，可以下发游戏奖励
            MiniGame.videoAd.offClose();
            UtilTool.log(" 小于 2.1.0 的基础库版本，res 是一个 undefined   播放完广告获取奖励");
            UtilTool.jsonLog(res)
            if (cb != null)
                cb("观看完整视频广告");
            Platform.gameReport(25)

            cb = null;
        }
        else {
            // 播放中途退出，不下发游戏奖励
            UtilTool.log(" 播放中途退出，不下发游戏奖励");
            cb = null;
            MiniGame.videoAd.offClose();
            // GameEvent.instance().dispatchCustomEvent(EventName.EName.SHOW_TIPS, {message: '广告未看完无法领取奖励'});
        }
        MiniGame.hideNoMaskLoading();
    })

    MiniGame.videoAd.onError(err => {

        console.log(err.errMsg)
        MiniGame.videoAd.offError();
        cb("");
        MiniGame.hideNoMaskLoading();
    })
}

MiniGame.addVivoRewardedVideoAd=(type, cb = null)=> {
    if (qg.getSystemInfoSync().platformVersionCode < 1031) {
        return;
    }
    //满足条件后就不看视频广告
    // this.showNoMaskLoading()
    Platform.gameReport(24)
    if (this.videoAd == null) {
        this.videoAd = WxHttpSdk.currentSys.createRewardedVideoAd({
            posId: '0c8774722c054e2382382acfe90fcdf9'
        })

    } else {
        this.videoAd.load().then(() => {
            console.log("激励视频广告加载成功111");
        }).catch(err => {
            console.log("激励视频广告加载失败111", err);

        });
    }


    this.videoAd.onLoad(() => {
        this.videoAd.offLoad();
        console.log("激励视频已加载");
    });

    this.videoAd.show().then(() => {
        console.log("激励视频广告显示成功11111");
    }).catch(err => {
        console.log("激励视频广告显示失败  1111", JSON.stringify(err));
        this.videoAd.load().then(() => {
            console.log("激励视频广告加载成功22222");
            this.videoAd.show().then(() => {
                console.log("激励视频广告显示成功 2222 ");
            })
        }).catch(err => {
            console.log("激励视频广告加载失败  2222", err);
            cb("");
            this.videoAd.offClose();
        });
    });
    this.videoAd.onClose(res => {
        // 用户点击了【关闭广告】按钮

        if (res && res.isEnded) {
            // 正常播放结束，可以下发游戏奖励
            this.videoAd.offClose();
            console.log("正常播放结束，可以下发游戏奖励");
            if (cb != null)
                cb("观看完整视频广告");
            cb = null;
        } else {
            // 播放中途退出，不下发游戏奖励
            this.videoAd.offClose();
            UtilTool.log(" 播放中途退出，不下发游戏奖励");
            cb = null;
            GameEvent.instance().dispatchCustomEvent(EventName.EName.SHOW_TIPS, {message: '广告未看完无法领取奖励'});
        }
        // this.hideNoMaskLoading();
    })

    this.videoAd.onError(err => {

        console.log("激励视频异常", err);
        this.videoAd.offError();

        // cb("");
        this.hideNoMaskLoading();
    })
}

//下载文件资源到本地
MiniGame.downloadFile = (url, cb) => {
    let downloadTask = MiniGame.currentSys.downloadFile({
        url: url,
        success(res) {
            cb(res);
        }
    })

    downloadTask.onProgressUpdate((res) => {
        console.log('下载进度', res.progress)
        console.log('已经下载的数据长度', res.totalBytesWritten)
        console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
    })

    // downloadTask.abort() // 取消下载任务
}

//保存图片到相册中
MiniGame.saveImageToPhotosAlbum = (tempFilePath) => {
    MiniGame.currentSys.saveImageToPhotosAlbum({filePath: tempFilePath})
}

//截图保存
MiniGame.saveScreenShot = (cb = null) => {
    var canvas = cc.game.canvas;
    var width = cc.winSize.width;
    var height = cc.winSize.height;
    canvas.toTempFilePath({
        x: 0,
        y: 0,
        width: width,
        height: height,
        destWidth: width,
        destHeight: height,
        success(res) {
            //.可以保存该截屏图片
            console.log(res);
            cb(res);
            // MiniGame.currentSys.saveImageToPhotosAlbum({filePath: res.tempFilePath})

        }
    })
}


//清除缓存目录下目前应用中未使用到的缓存资源
MiniGame.cleanOldAssets = () => {
    MiniGame.currentSys.downloader.cleanOldAssets()
}

//剪贴板
MiniGame.setClipboardData = (data) => {
    MiniGame.currentSys.setClipboardData({
        data: data,
        success(res) {
            MiniGame.currentSys.showToast({
                title: '已复制到粘贴板',
                icon: 'success',
                duration: 2000
            })
            console.log(res)
            // MiniGame.currentSys.getClipboardData({
            //     success(res) {
            //         console.log(res.data) // data
            //     }
            // })
        }
    })
}

//获取系统剪贴板的内容
MiniGame.getClipboardData = (cb) => {
    MiniGame.currentSys.getClipboardData({
        success(res) {
            console.log(res.data)
            cb(res.data);
        }
    })
}

MiniGame.vibrateShort = () => {
    if (MiniGame.loginType > 2) return;
    MiniGame.currentSys.vibrateShort()
}

MiniGame.showMsg = (msgStr) => {
    UtilTool.log('msgStr  ' + msgStr)
    // GameEvent.instance().dispatchCustomEvent(EventName.EName.SHOW_TIPS, {message: msgStr});
}

//设置是否保持常亮状态
MiniGame.setKeepScreenOn = () => {
    MiniGame.currentSys.setKeepScreenOn({keepScreenOn: true});
}

MiniGame.exitMiniProgram = () => {
    if (cc.sys.OPPO_GAME == cc.sys.platform) {
        MiniGame.currentSys.exitApplication({})
    } else {
        MiniGame.currentSys.exitMiniProgram({})
    }

}

MiniGame.triggerGC = () => {
    UtilTool.log('triggerGC triggerGC  ')
    MiniGame.currentSys.triggerGC()
}
/************** oppo   ***************/

/**
 * 广告初始化
 */
MiniGame.initAdService = () => {
    if (cc.sys.OPPO_GAME != cc.sys.platform) return;
    qg.initAdService({
        appId: MiniGame.oppoAppId,
        isDebug: false,
        success:
            function (res) {
                console.log("success");
            },
        fail: function (res) {
            console.log("fail:" + res.code + res.msg);
        },
        complete: function (res) {
            console.log("complete");
        }
    })
}


MiniGame.addQGRewardedVideoAd = (cb) => {
    let platformVersion = qg.getSystemInfoSync().platformVersion;
    UtilTool.log("视频广告加载成功  platformVersion   " + platformVersion);
    if (platformVersion <= 1040) {
        cb('');
        return;
    }
    UtilTool.log("视频广告加载成功  addRewardedVideoAd   2222222 ");
    if (!MiniGame.videoAd) {
        MiniGame.videoAd = qg.createRewardedVideoAd({
            posId: '114309'
        })
        UtilTool.log("视频广告加载成功  addRewardedVideoAd   33333 ");

        MiniGame.videoAd.load();
        UtilTool.log("视频广告加载成功  addRewardedVideoAd   load 33333 ");

        MiniGame.videoAd.onLoad(() => {
            UtilTool.log("视频广告加载成功");
            MiniGame.videoAd.show();
            MiniGame.videoAd.offLoad()
        })
    } else {
        // 用户触发广告后，显示激励视频广告
        MiniGame.videoAd.show();
        UtilTool.log("视频广告加载成功  addRewardedVideoAd   4444 ");

    }


    MiniGame.videoAd.onVideoStart(function () {
        console.log("激励视频 开始播放");
        MiniGame.videoAd.offVideoStart()
    })


    MiniGame.videoAd.onClose(res => {
        if (res && res.isEnded) {
            // 正常播放结束，可以下发游戏奖励
            MiniGame.videoAd.offClose();
            UtilTool.jsonLog(res)
            if (cb != null)
                cb("观看完整视频广告");
            Platform.gameReport(25)

            cb = null;
        }
        else {
            // 播放中途退出，不下发游戏奖励
            UtilTool.log(" 播放中途退出，不下发游戏奖励");
            cb = null;
            MiniGame.videoAd.offClose();
            // GameEvent.instance().dispatchCustomEvent(EventName.EName.SHOW_TIPS, {message: '广告未看完无法领取奖励'});
        }
        MiniGame.hideNoMaskLoading();
    })

    MiniGame.videoAd.onError(err => {
        UtilTool.log('qg  videoAd.onError ')
        UtilTool.jsonLog(err)
        cb("");
        MiniGame.videoAd.offError();
        MiniGame.hideNoMaskLoading();
    })
}
/**
 * vivo
 */

/**
 * 获得当前屏幕亮度值
 */
MiniGame.getScreenBrightness = () => {
    if (cc.sys.VIVO_GAME == cc.sys.platform) {
        qg.getScreenBrightness({
            success: function (data) {
                console.log(`handling success, value = ${data.value}`)
            },
            fail: function (data, code) {
                console.log(`handling fail, code = ${code}`)
            }
        })
    }
}

/**
 *  设置当前屏幕亮度值
 * @param value
 */
MiniGame.setScreenBrightness = (value = 100) => {
    if (cc.sys.VIVO_GAME == cc.sys.platform) {
        qg.setScreenBrightness({
            value: value,
            success: function () {
                console.log('handling success')
            },
            fail: function (data, code) {
                console.log(`handling fail, code = ${code}`)
            }
        })
    }
}

/**
 * 设置是否保持常亮状态
 * @param isKeepScreenOn
 */
MiniGame.setKeepScreenOn = (isKeepScreenOn = true) => {
    if (cc.sys.VIVO_GAME == cc.sys.platform) {
        qg.setKeepScreenOn({
            keepScreenOn: isKeepScreenOn,
            success: function () {
                console.log('handling success')
            },
            fail: function (data, code) {
                console.log(`handling fail, code = ${code}`)
            }
        })
    }
}
/**
 * 获取桌面图标是否创建
 */
MiniGame.hasShortcutInstalled = () => {
    if (cc.sys.VIVO_GAME == cc.sys.platform) {
        qg.hasShortcutInstalled({
            success: function (status) {
                if (status) {
                    console.log('已创建')
                } else {
                    console.log('未创建')
                }
            }
        })
    }
}


/**
 * 判断用户是否通过桌面图标来启动应用
 */
MiniGame.isStartupByShortcut = () => {
    if (cc.sys.VIVO_GAME == cc.sys.platform) {
        qg.isStartupByShortcut({
            success: function (status) {
                if (status) {
                    console.log('通过桌面图标启动应用')
                } else {
                    console.log('不是通过桌面图标启动应用')
                }
            }
        })
    }
}

/****  oppo   *****/

//设置游戏加载进度页面
MiniGame.setLoadingProgress = (progress) => {
    if (this.currentSys != 2) {
        return;
    }
    qg.setLoadingProgress({
        progress: progress
    });
}

MiniGame.loadingComplete = () => {
    if (this.currentSys != 2) {
        return;
    }
    qg.loadingComplete({
        complete: function (res) {
        }
    });
}






