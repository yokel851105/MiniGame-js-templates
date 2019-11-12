import AttributeData from "../game/data/AttributeData";
import UtilTool from "../util/UtilTool";

/**
 * app  http
 * @type {{}}
 */
const NativeHttp = {

    send(url, resolve, reject, sendData = {}, type = 'POST') {
        let xhr = new XMLHttpRequest();
        console.log("HttpNet   url:" + url);
        xhr.open(type, url, true);
        xhr.timeout = 5000;
        xhr.setRequestHeader("Content-Type", 'application/json;charset=utf-8')
        xhr.setRequestHeader('uid', AttributeData.userId)
        xhr.setRequestHeader("token", AttributeData.accessToken)
        UtilTool.log('-----------------------')
        UtilTool.log(xhr.getAllResponseHeaders())

        xhr.onerror = (what) => {
            console.log("onerror");
        }
        xhr.ontimeout = (what) => {
            xhr.abort();
        }

        xhr.onreadystatechange = () => {
            console.log("http state, readyState = " + xhr.readyState + ", status = " + xhr.status);
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    var response = xhr.responseText;
                    UtilTool.log("http success：" + response);
                    var answer = JSON.parse(response);
                    UtilTool.jsonLog(answer, "http success： answer =");
                    if (!answer) {
                        UtilTool.log("answer json error:" + response);
                        return;
                    }
                    if (resolve) resolve(answer);
                } else {
                    var response = xhr.responseText;
                    reject(response);
                    UtilTool.log("http error, readyState = " + xhr.readyState + ", status = " + xhr.status);
                }
            }
        }

        if (sendData) {
            xhr.send(JSON.stringify(sendData));
        } else {
            xhr.send();
        }

    }
}

export default NativeHttp