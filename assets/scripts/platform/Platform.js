import ReportEvent from "../report/ReportEvent";
import UtilTool from "../util/UtilTool";


const Platform = {

    platformCallback(cb) {
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            cb();
        } else if (cc.sys.isNative) {
            if (cc.sys.ANDROID === cc.sys.platform) {
                console.log(" android   平台")
            } else {
                console.log(" ios   平台")
            }
        }
    },

    gameReport(index) {
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            ReportEvent.gameReport(index);
        } else if (cc.sys.isNative) {
            if (cc.sys.ANDROID === cc.sys.platform) {
                // UtilTool.log(" android   平台")
            } else {
                // UtilTool.log(" ios   平台")
            }
        }
    },

    guideRepot(index) {
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            ReportEvent.guideRepot(index);
        } else if (cc.sys.isNative) {
            if (cc.sys.ANDROID === cc.sys.platform) {
                // UtilTool.log(" android   平台")
            } else {
                // UtilTool.log(" ios   平台")
            }
        }
    },




}

export default Platform;