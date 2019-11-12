import UtilTool from "../../util/UtilTool";
import Config from "../../tabel/Config";

const Global = {
    nickName: '',                                                                       //获取自己的昵称
    avatarUrl: '',                                                                      //获取自己的头像
    gender: 0,
    province: '',
    city: '',
    phoneModel: '',

    initData(data) {
        this.nickName = data.nickName || data.nikename;
        this.avatarUrl = data.avatarUrl;
        this.gender = data.gender;
        this.province = data.province;
        this.city = data.city;
    },

    initQGData(data) {
        this.nickName = data.nickName;
        this.avatarUrl = data.avatar;
        this.gender = '';
        this.province = '';
        this.city = '';
    },

    getAlignRatio() {
        this.isFull = false;
        let w = cc.winSize.width;
        let h = cc.winSize.height;
        let ratio = h / w;
        this.ratio = ratio;
        UtilTool.log('屏幕的宽高比 ' + ratio);
        if (ratio > 2.1) {
            this.isFull = true;
            this.phoneModel = Config.iphoneX;
        } else if (ratio >= 2.0) {
            this.phoneModel = Config.androidX;
            this.isFull = true;
        } else {
            this.phoneModel = '';
            this.isFull = false;
        }

        console.log(this.isFull);
    }

}

export default Global;