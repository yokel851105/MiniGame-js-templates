/**
 * 主场景
 */
import Global from "./data/Global";
import Config from "../tabel/Config";
import MainModel from "./model/MainModel";
import UtilTool from "../util/UtilTool";
import AttributeData from "./data/AttributeData";
import {AudioManager} from "../util/AudioManager";

cc.Class({
    extends: cc.Component,

    properties: {
        uidLab: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        //初始化自定义事件
        clientEvent.init();
        AudioManager.init()
        AudioManager.reLoadRes('sound');
    },
    onEnable() {
        clientEvent.on(clientEvent.eventType.testEvent, (data) => (
            UtilTool.log('clientEvent.eventType.testEvent===  ' + data.msg)
        ), this)
    },

    start() {
        UtilTool.log(cc.sys.isNative)
        UtilTool.log(cc.sys.isBrowser)
        UtilTool.log(cc.sys.platform)

        //获取适配信息
        Global.getAlignRatio();
        HttpNetwork.init();

        MiniGame.getShowData();


        // MiniGame.
        this.requestMainData();
    },
    requestMainData() {
        // 调用你的要在微信上要执行的方法

        this.mainModel = new MainModel();
        this.mainModel.checkoutVersion(Config.version, () => {
            // this.mainModel.login(() => {
            // });
        });

    },

    login() {
        // this.mainModel.login(() => {
        //     this.uidLab.string = 'userId:' + AttributeData.userId;
        // });

        let userId_duid = cc.sys.localStorage.getItem('userId_duid') || '';

        // if (userId_duid.length <= 0) {
        //     let duid = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getDuid", "()Ljava/lang/String;");
        //     userId_duid = duid;
        //     cc.sys.localStorage.setItem('userId_duid', duid);
        // }
        if (cc.sys.isNative){
            var ret = jsb.reflection.callStaticMethod("NativeOcClass",
                "getDeviceIDInKeychain");

            console.log('--------ios---0873808D-BF55-499B-BA6B-51989CBEF688-------',ret);
        }

    },

    onDestroy() {
        clientEvent.clear(this)
    }
});
