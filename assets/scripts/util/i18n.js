const i18n = require('LanguageData');
cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        i18n.init('zh');
        this.isChanged = true;
    },

    start() {
        // i18n.init('en');
    },

    update(dt) {
        i18n.updateSceneRenderers();
    },

    changLanguage() {
        this.isChanged = !this.isChanged;
        i18n.init('en');
        if (this.isChanged) {
            i18n.init('zh');
        }
    }

});
