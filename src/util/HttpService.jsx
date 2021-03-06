import 'whatwg-fetch';
import LocalStorge from './LogcalStorge.jsx';
const localStorge = new LocalStorge();
export default class HttpService {

    static getBaseUrl() {

        var url = window.getServerUrl();//"http://localhost:8080/";
        return url;
    }

    static isLogin(url) {
        return (undefined == localStorge.getStorage('userInfo') && url != '/reportServer/user/encodePwd' && url != '/reportServer/user/Reactlogin') || ('' == localStorge.getStorage('userInfo') && url != '/reportServer/user/encodePwd' && url != '/reportServer/user/Reactlogin');
    }

    //
    static post(url, param) {
        if (this.isLogin(url)) {
            window.location.href = '#login';
            return new Promise((resolve, reject) => { });
        } else {
            const fullUrl = HttpService.getBaseUrl() + url;
            let opts = {
                method: 'POST',
                headers: {
                    credentials: JSON.stringify(localStorge.getStorage('userInfo') || '')
                },
                body: param
            };

            return fetch(fullUrl, opts).then((response) => {
                //console.log(response.json())
                return response.json();
            }).catch((error) => {
                return error.json();
            });
        }
    }

    static getFile(url) {
        if (this.isLogin(url)) {
            window.location.href = '#login';
            return new Promise((resolve, reject) => { });
        } else {
            const fullUrl = HttpService.getBaseUrl() + url;
            let opts = {
                method: 'GET',
                headers: {
                    credentials: JSON.stringify(localStorge.getStorage('userInfo') || '')
                },
            };

            return fetch(fullUrl, opts);
        }
    }

    static uploadImage(url, imageFile, params) {
        if (this.isLogin(url)) {
            window.location.href = '#login';
            return new Promise((resolve, reject) => { });
        } else {
            return new Promise(function (resolve, reject) {
                let formData = new FormData();
                if (params != null && typeof params != 'undefinde') {
                    for (var key in params) {
                        formData.append(key, params[key]);
                    }
                }

                formData.append("file", imageFile);
                const fullUrl = HttpService.getBaseUrl() + url;
                fetch(fullUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data;charset=utf-8',
                        credentials: JSON.stringify(localStorge.getStorage('userInfo') || '')
                    },
                    body: formData,
                }).then((response) => response.json())
                    .then((responseData) => {
                        console.log('uploadImage', responseData);
                        resolve(responseData);
                    })
                    .catch((err) => {
                        console.log('err', err);
                        reject(err);
                    });
            });
        }




    }


}
