const AttributeData = {
    userId: '',
    accessToken: '',
    sessionKey: '',
    nickname: '',
    headImg: '',
    initData(data) {
        this.userId = data.userId;
        this.accessToken = data.accessToken;
        this.sessionKey = data.sessionKey;
        this.nickname = data.nickname;
        this.headImg = data.headImg;
    }
}
export default AttributeData;