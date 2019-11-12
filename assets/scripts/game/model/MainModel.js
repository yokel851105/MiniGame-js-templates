import UtilTool from "../../util/UtilTool";
import AttributeData from "../data/AttributeData";

class MainModel {
    checkoutVersion(version, cb) {
        HttpNetwork.checkoutVersion(version).then((res) => {
            if (0 === res.code) {
                NetUrlConfig.betaUrl = res.data.domain;
                NetUrlConfig.prodUrl = res.data.domain;
                NetUrlConfig.loginUrl = res.data.domain;
                NetUrlConfig.loginProdUrl = res.data.domain;
                cb();
            }
        }).catch((res) => {
            UtilTool.jsonLog(res, ' checkoutVersion  ');
        })
    }

    login(cb) {
        HttpNetwork.login().then((res) => {
            if (0 === res.code) {
                AttributeData.initData(res.data)
                cb();
                clientEvent.dispatch(clientEvent.eventType.testEvent, {msg: 'mzgame testEvent'})
            }
        }).catch((res) => {
            UtilTool.log(' login  ' + res);
        })
    }
}

export default MainModel;