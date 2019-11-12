/**
 *
 * 工具类
 */



const BASE = ['K', 'M', 'B', 'T']
const ADV = [
    'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l',
    'm', 'n', 'o', 'p', 'q', 'r',
    's', 't', 'u', 'v', 'w', 'x',
    'y', 'z',
]

const UtilTool = {
    isPrint: true,        //上线后设置false
    gameName: '****MZGAME-TEMPLATE**** ',
    //打印
    log(str, parm = '') {
        if (UtilTool.isPrint) {
            console.log(this.gameName + str + ' ' + parm);
        }
    },

    jsonLog(str, tagStr = '') {
        if (UtilTool.isPrint) {
            console.log(this.gameName + tagStr + JSON.stringify(str));
        }
    },
    //设置头像
    setAvatarUrl(userIcon, avatarUrl) {
        // this.log('avatarUrl = ' + avatarUrl)
        if ('' == avatarUrl) {
            return;
        }
        cc.loader.load({
            url: avatarUrl, type: 'png'
        }, (err, texture) => {
            if (err) return;
            userIcon.spriteFrame = new cc.SpriteFrame(texture);
        });
    },
    setAvatarUrlCb(userIcon, avatarUrl, cb = null) {
        cc.loader.load({
            url: avatarUrl, type: 'png'
        }, (err, texture) => {
            if (err) console.error(err);
            userIcon.spriteFrame = new cc.SpriteFrame(texture);
            cb();
        });
    },

    setAvatarArr(userIconArr, avatarUrlArr, cb = null) {
        this.count = 0;
        let _self = this;
        _self.urlLen = userIconArr.length;
        for (let i = 0; i < _self.urlLen; ++i) {
            cc.loader.load({
                    url: avatarUrlArr[i], type: 'png'
                }, (err, texture) => {
                    if (err)
                        console.error(err);
                    userIconArr[i].spriteFrame = new cc.SpriteFrame(texture);
                    ++_self.count;
                    this.log('count ==' + _self.count)
                    if (_self.count === _self.urlLen) {
                        this.log('count == _self.count ' + _self.count)
                        cb();
                    }
                }
            );
            this.log('count    222  ==' + _self.count)
        }
    },


    //随机数
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },

//判断是不是中文
    isChineseOrOther(str) {
        var reCh = /[^\u0000-\u00FF]/;
        //验证是否是中文
        var pattern = new RegExp("[\u4E00-\u9FA5]+");
        //验证是否是英文
        var pattern2 = new RegExp("[A-Za-z]+");
        //验证是否是数字
        var pattern3 = new RegExp("[0-9]+");

        let tag = 0;
        if (pattern.test(str)) {
            tag = 0;
        } else if (pattern2.test(str)) {
            tag = 1;
        } else if (pattern3.test(str)) {
            tag = 2;
        }
        return tag;
    },


    dialogLenStat(target) {
        let strlen1 = 0;
        let strlen2 = 0;
        let strlen3 = 0;
        //var txtval = $.trim(target.val());
        for (let i = 0; i < target.length; i++) {
            switch (this.isChineseOrOther(target.charAt(i))) {
                case 0:
                    strlen1 = strlen1 + 1
                    break;
                case 1:
                    strlen2 = strlen2 + 1
                    break;
                case 2:
                    strlen3 = strlen3 + 1
                    break;
            }
        }
        this.log('strlen1 =  ' + strlen1 + '   英文 = ' + strlen2 + '  数字=' + strlen3)
        // strlen = strlen1 + strlen2;
        // strlen = Math.ceil(strlen / 2);//中英文相加除2取整数
        return [strlen1, strlen2, strlen3];
    },
    isChinese(str) {
        var reCh = /[^\u0000-\u00FF]/;
        return reCh.test(str);
    },

//获取文字或英文名称的长度
    lenStat(target) {
        let strlen = 0; //初始定义长度为0
        let strlen1 = 0;
        let strlen2 = 0;
        //var txtval = $.trim(target.val());
        for (let i = 0; i < target.length; i++) {
            if (this.isChinese(target.charAt(i)) == true) {
                strlen1 = strlen1 + 2;//中文为2个字符
            } else {
                strlen2 = strlen2 + 1;//英文一个字符
            }
        }
        // this.log('strlen1 + strlen2   ' + strlen1 + '   英文  ' + strlen2)
        strlen = strlen1 + strlen2;
        strlen = Math.ceil(strlen / 2);//中英文相加除2取整数
        return strlen;
    },

    stringSub(target, len, isEllipsis = false) {
        let l = this.lenStat(target);
        // this.log('stringSub  ' + l);
        let returnStr = target;
        if (l > len) {
            returnStr = returnStr.substring(0, len) + "..."
        }
        if (isEllipsis) {
            returnStr = returnStr.substring(0, len)
        }
        return returnStr;
    },

    /**
     * 数字转化
     * @param {number} num 原数字 (接受科学计数法)
     * @param {number} short 小数位数
     */
    convertToScient(num, short = null) {
        if (num.toString() === '0') {
            return '0'
        }
        if (Math.floor(num) === 0) {
            return '1'
        }
        const norNum = num.toString().split('e')
        const tail = short !== null ? (short > 4 ? 4 : short) : 2
        if (norNum.length > 1) {
            return this._calSci(norNum, tail)
        }

        const numArr = this._iteration(parseInt(norNum[0]))
        let res = ''
        const head = numArr[0]

        let dec = ''
        let unit = ''
        if (numArr.length - 1 > 0) {
            unit = this._calUnit(numArr.length - 1)
            dec = short !== 0 ? this._calDecimal(numArr[1], tail) : ''
        }

        res = `${head}${dec}${unit}`
        return res
    },
    _calDecimal(decimal, short) {
        const dec = `${decimal / 1000}`
        let res = ''
        if (short > 0) {
            res += '.'
            for (let i = 0; i < short; i++) {
                res += dec[i + 2] ? dec[i + 2] : '0'
            }
        }

        return res
    },
    _calUnit(n) {
        let unit = ''

        if (n <= 4) {
            unit = BASE[n - 1]
        } else {
            let act_num = n - 4 + 26
            while (act_num > 0) {
                unit = ADV[(act_num - 1) % 26] + unit
                act_num = Math.floor((act_num - 1) / 26)
            }
        }

        return unit
    },
    _iteration(num) {
        let arr = []
        num = Math.floor(num)
        while (num > 0) {
            arr.unshift(num % 1000)
            num = Math.floor(num / 1000)
        }
        return arr
    },
    _calSci(arr, tail) {
        let base = parseFloat(arr[0])
        const exp = parseInt(arr[1])
        const nk = exp / 3 >> 0
        base *= Math.pow(10, exp % 3)
        const decimalInBase = (base - (base >> 0)) * 1000 >> 0

        const res = `${base >> 0}${this.calDecimal(decimalInBase, tail)}${this.convertUnit(nk)}`
        return res
    },


    convertUnit(num) {
        if (num === null) {
            return 0;
        }
        let proNum = num;
        let numStr = '' + proNum;
        let len = numStr.length;
        if (len <= 3) {
            return numStr;
        }
        let unit = '';
        if (len >= 10) {
            proNum = proNum / 100000000;
            unit = 'B';
        } else if (len >= 7) {
            proNum = proNum / 1000000;

            unit = 'M';
        } else if (len >= 4) {
            proNum = proNum / 1000;
            unit = 'K';
        }
        numStr = Math.floor(proNum * 10) / 10;
        numStr = 10 * numStr;
        if ((numStr % 10) == 0) {
            numStr = (numStr / 10).toFixed(0);
        } else {
            numStr = (numStr / 10).toFixed(1);
        }
        return numStr + unit;
    },
    /**
     *  skeUrl: 'sea/dahai_ske.json',
     *texUrl: 'sea/dahai_tex.json',
     *pngUrl: 'sea/dahai_tex.png',
     *armatureName:'Armature',
     *animationName:'dahai'
     * @param parent
     * @param armatureName
     * @param animationName
     */

    remoteAni(parent, aniBaseUrl, aniData) {
        let animNode = new cc.Node();
        animNode.parent = parent;
        let dragonDisplay = animNode.addComponent(dragonBones.ArmatureDisplay);

        let image = aniBaseUrl + aniData.pngUrl;
        let ske = aniBaseUrl + aniData.skeUrl
        let atlas = aniBaseUrl + aniData.texUrl;
        cc.loader.load(image, (error, texture) => {
            cc.loader.load({url: atlas, type: 'txt'}, (error, atlasJson) => {
                cc.loader.load({url: ske, type: 'txt'}, (error, dragonBonesJson) => {
                    let atlas = new dragonBones.DragonBonesAtlasAsset();
                    atlas.atlasJson = atlasJson;
                    atlas.texture = texture;

                    let asset = new dragonBones.DragonBonesAsset();
                    asset.dragonBonesJson = dragonBonesJson;

                    dragonDisplay.dragonAtlasAsset = atlas;
                    dragonDisplay.dragonAsset = asset;

                    dragonDisplay.armatureName = aniData.armatureName;
                    dragonDisplay.playAnimation(aniData.animationName, 0);
                });
            });
        });
    },


    randomsort(a, b) {
        return Math.random() > 0.5 ? -1 : 1;
        //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
    },

    /**
     *
     * @param fixtureSp         sprite
     * @param buildItemBase     图集
     * @param icon              icon name
     */
    setSpSpriteFrame(sp, atlasName, iconName) {
        var frame = atlasName.getSpriteFrame(iconName);
        sp.spriteFrame = frame;
    },


//动态生成龙骨☎动画
    /**
     *
     * @param animationDisplay
     * @param path
     * @param armatureName
     * @param newAnimation
     * @param playTimes
     */
    loadDragonBones(animationDisplay, path, armatureName, newAnimation, playTimes = 1, cb = () => {
    }) {  //动态加载龙骨
        cc.loader.loadResDir(path, (err, assets) => {
            UtilTool.log('2222 assets.length=' + assets.length);
            if (err || assets.length <= 0) return;
            assets.forEach(asset => {
                if (asset instanceof dragonBones.DragonBonesAsset) {
                    animationDisplay.dragonAsset = null;
                    animationDisplay.dragonAsset = asset;
                }
                if (asset instanceof dragonBones.DragonBonesAtlasAsset) {
                    animationDisplay.dragonAtlasAsset = null;
                    animationDisplay.dragonAtlasAsset = asset;
                }
            });

            animationDisplay.armatureName = armatureName + '';
            animationDisplay.playAnimation(newAnimation, playTimes);
            cb();
        })

    },

    /**
     * 微信版本管理
     */
    updateVersion() {
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            const updateManager = MiniGame.currentSys.getUpdateManager()

            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
                UtilTool.log('updateManager updateManager ');
                UtilTool.log(res.hasUpdate)
                UtilTool.log('updateManager cleanOldAssets ');
            })

            updateManager.onUpdateReady(function () {
                UtilTool.log('新版本已经准备好，是否重启应用？');
                updateManager.applyUpdate()

                MiniGame.currentSys.showModal({
                    title: '更新提示',
                    content: '新版本已经准备好，是否重启应用？',
                    success(res) {
                        if (res.confirm) {
                            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                            updateManager.applyUpdate()
                        }
                    }
                })
            })

            updateManager.onUpdateFailed(function () {
                // 新版本下载失败
            })
        }

    },

    formatTime(time) {
        var _s = time / 1000 >> 0
        var s = _s % 60
        var m = (_s / 60 >> 0) % 60
        var h = _s / 3600 >> 0

        s = s >= 10 ? s.toString() : '0' + s
        m = m >= 10 ? m.toString() : '0' + m
        h = h >= 10 ? h.toString() : '0' + h
        return h + ':' + m + ':' + s
    },

    commaSplitNumber(num) {
        num = num.toString()
        var l = num.length
        if (l <= 4) {
            return num
        }
        var res = ''
        for (var i = 0; i < l; i++) {
            res = num[l - i - 1] + res
            if (i + 1 < l && (i + 1) % 3 === 0) {
                res = ',' + res
            }
        }
        return res
    },

    //设置通用富文本
    //<outline color=#521010 width=2><b></outline></b>
    setBtnRichText(richText, str) {
        richText.string = '<outline color=#1c1a38 width=2><b>' + str + '</outline></b>';
    },

}

export default UtilTool;