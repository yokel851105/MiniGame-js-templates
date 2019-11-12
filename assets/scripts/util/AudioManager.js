
export const AUDIO_URL = {
    BGM_MAIN: 'sound/loading/bgmusic',
}


/**
 * func: 音乐，音效管理
 */
export const AudioManager = {

    init() {
        this._playMusic = {};             // 缓存音乐，{name: ID}
        this._playEffect = {};             // 缓存音效，{name: ID}
        this._switchMusic = false;          // 音乐开关
        this._switchEffect = false;          // 音效开关
        this._effectVolume = 1;              // 音效音量
        this._musicVolume = 1;              // 音乐音量

        this._lastMusicData = {url: '', loop: false}

        // 获取本地设置音量大小
        const sAudio = cc.sys.localStorage.getItem('audio')
        if (sAudio) {
            let audioSetting = JSON.parse(sAudio)
            this._effectVolume = audioSetting['effect'] || 1
            this._musicVolume = audioSetting['music'] || 1
        } else {
            this._effectVolume = 1
            this._musicVolume = 1
        }

        //获取本地开关设置
        // WxHttpSdk.getStorage('audioSwitch', (sSwitch)=>{
        //     console.log('===========audioSwitch================')
        //     console.log(sSwitch['switchMusic'])

        //     let switchSetting = JSON.parse(sSwitch)
        //     console.log(switchSetting)
        //     if (switchSetting['switchMusic']) {
        //         this.initSwitch(switchSetting["switchMusic"], switchSetting["switchEffect"])
        //     } else {
        //         this.initSwitch(true, true);
        //     }
        // })

        const sSwitch = cc.sys.localStorage.getItem('audioSwitch');
        if (sSwitch) {
            let switchSetting = JSON.parse(sSwitch)
            this.initSwitch(switchSetting["switchMusic"], switchSetting["switchEffect"])
        } else {
            this.initSwitch(true, true);
        }


    },

    /**
     * 初始化音乐，音效开关
     */

    initSwitch(switchMusic, switchEffect) {
        this._switchEffect = switchEffect;
        this._switchMusic = switchMusic;
    },

    /**
     * 加载文件夹下所有音频资源
     * url: 资源所在文件夹
     */
    reLoadRes(url, cb = null) {
        cc.loader.loadResDir(url, cc.AudioClip, (cc, tc, item) => {
            // console.log(`${cc}/${tc}`)
        }, (err, res, urls) => {
            if (err) {
                cc.error("【音频】资源加载错误");
                return;
            }
            if (cb) cb()
            // console.log(urls)
        });
    },

    /**
     * 播放音效文件
     * url: 音效文件相对地址
     * loop: 是否循环播放
     */
    playEffect(url, loop = false) {
        if (this._switchEffect) {
            // var rawUrl = url//cc.url.raw(url);
            let clip = cc.loader.getRes(url)//rawUrl)
            if (clip) {
                var effectId = cc.audioEngine.playEffect(clip, loop); //, this._musicVolume);
                this._playEffect[url] = effectId;
            }
            else {
                cc.warn("【音频】音效" + url + "文件不存在");
            }
        }


    },

    /**
     * 转换音效开关
     */
    switchEffectFunc() {
        this._switchEffect = !this._switchEffect;
        if (!this._switchEffect) {
            this.setStopAllEffect();
        }

        // WxHttpSdk.setStorage('audioSwitch', JSON.stringify({
        //     switchEffect: this._switchEffect,
        //     switchMusic: this._switchMusic
        // }))
        cc.sys.localStorage.setItem("audioSwitch", JSON.stringify({
            switchEffect: this._switchEffect,
            switchMusic: this._switchMusic
        }));
    },

    /**
     * 获取音效开关状态
     */
    getSwitchEffect() {
        return this._switchEffect;
    },

    /**
     * 设置音效声音大小
     * value: 0.0 - 1.0
     */
    setEffectVolume(value) {
        this._effectVolume = value;
        cc.audioEngine.setEffectsVolume(value);
        cc.sys.localStorage.setItem("audio", JSON.stringify({effect: this._effectVolume, music: this._musicVolume}));
    },

    /**
     * 获取音效大小
     * @return 0.0 - 1.0
     */
    getEffectVolume() {
        return cc.audioEngine.getEffectsVolume();
    },

    /**
     * 暂停指定音效
     * url： 资源路径
     */
    setPauseEffect(url) {
        var audio = this._playEffect[url];
        if (audio) {
            cc.audioEngine.pauseEffect(audio);
        }
        else {
            cc.error("【音频】音效文件" + url + "不存在");
        }
    },

    /**
     * 暂停正在播放的所有音效
     */
    setPauseAllEffect() {
        cc.audioEngine.pauseAllEffects();
    },

    /**
     * 恢复指定音效
     * url:资源路径
     */
    setResumeEffect(url) {
        var audio = this._playEffect[url];
        if (audio) {
            cc.audioEngine.resumeEffect(audio);
        }
        else {
            cc.error("【音频】音效文件" + url + "不存在");
        }
    },

    /**
     * 恢复当前说暂停的所有音效
     */
    setResumeAllEffect() {
        cc.audioEngine.resumeAllEffects();
    },

    /**
     * 停止播放指定音效
     * url: 资源路径
     */
    setStopEffect(url) {
        var audio = this._playEffect[url];
        if (audio) {
            cc.audioEngine.stopEffect(audio);
        }
        else {
            cc.error("【音频】音效文件" + url + "不存在");
        }
    },

    /**
     * 停止播放所有正在播放的音效
     */
    setStopAllEffect() {
        cc.audioEngine.stopAllEffects();
    },

    /**
     * 背景音乐播放
     * url: 资源路径
     * loop: 是否循环
     */
    playMusic(url, loop = false) {
        this._lastMusicData.url = url
        this._lastMusicData.loop = loop
        if (this._switchMusic) {
            // var rawUrl = url//cc.url.raw(url);
            let clip = cc.loader.getRes(url)//rawUrl)
            if (clip) {
                cc.audioEngine.playMusic(clip, loop);
            } else {
                cc.warn("【音频】音乐" + url + "文件不存在");
            }
        }
    },

    /**
     * 转换音乐按钮开关
     */
    switchMusicFunc() {
        this._switchMusic = !this._switchMusic;
        if (!this._switchMusic) {
            this.setStopMusic();
        } else {
            this.playMusic(this._lastMusicData.url, this._lastMusicData.loop)
        }

        // WxHttpSdk.setStorage('audioSwitch', JSON.stringify({
        //     switchEffect: this._switchEffect,
        //     switchMusic: this._switchMusic
        // }))
        cc.sys.localStorage.setItem("audioSwitch", JSON.stringify({
            switchEffect: this._switchEffect,
            switchMusic: this._switchMusic
        }));
    },

    /**
     * 获取音乐开关状态
     */
    getSwitchMusic() {
        return this._switchMusic;
    },

    /**
     * 暂停当前播放音乐
     */
    setPauseMusic() {
        cc.audioEngine.pauseMusic();
    },

    /**
     * 恢复当前被暂停音乐音乐
     */
    setResumeMusic() {
        cc.audioEngine.resumeMusic();
    },

    /**
     * 重新播放该背景音乐
     */
    replayMusic() {
        cc.audioEngine.rewindMusic();
    },

    /**
     * 暂停播放音乐
     * releaseData： 控制是否释放音乐资源 true释放资源 | false不释放资源
     */
    setStopMusic(releaseData = true) {
        cc.audioEngine.stopMusic(releaseData);
    },

    setMusicVolume(value) {
        this._musicVolume = value;
        cc.audioEngine.setMusicVolume(value);
        cc.sys.localStorage.setItem("audio", JSON.stringify({effect: this._effectVolume, music: this._musicVolume}));
    },

    getMusicVolume() {
        return cc.audioEngine.getMusicVolume();
    },

    /**
     * 音乐是否正在播放（验证些方法来实现背景音乐是否播放完成）
     * return boolen
     */
    isMusicPlaying() {
        return cc.audioEngine.isMusicPlaying();
    },

    /**
     * 释放指定音效资源
     * url
     */
    releaseAudio(url) {
        // var rawUrl = url//cc.url.raw(url);
        let clip = cc.loader.getRes(url)
        if (clip) {
            // cc.audioEngine.unloadEffect(rawUrl);
            cc.audioEngine.uncache(clip)
        }
        else {
            cc.error("【音频】资源" + url + "不存在， 释放失败");
        }

    },

    releaseAllAudio() {
        cc.audioEngine.uncacheAll();
    },

}

// export const AudioManager;