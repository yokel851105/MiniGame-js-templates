cc.Class({
    extends: cc.Component,

    properties: {
        pressedScale: 0.9,
        transDuration: 0.1,
    },

    // use this for initialization
    onLoad: function () {
        let self = this;

        // let audioMng = cc.find('Menu/AudioMng') || cc.find('Game/AudioMng')
        // if (audioMng) {
        //     audioMng = audioMng.getComponent('AudioMng');
        // }
        self.initScale = this.node.scale;
        self.button = self.getComponent(cc.Button);
        self.scaleDownAction = cc.scaleTo(self.transDuration, self.pressedScale);
        self.scaleUpAction = cc.scaleTo(self.transDuration, self.initScale);

        function onTouchDown(event) {
            this.stopAllActions();
            this.runAction(self.scaleDownAction);
        }

        function onTouchUp(event) {
            this.stopAllActions();
            this.runAction(self.scaleUpAction);

        }

        this.node.on('touchstart', onTouchDown, this.node);
        this.node.on('touchend', onTouchUp, this.node);
        this.node.on('touchcancel', onTouchUp, this.node);
    },

});
