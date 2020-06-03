import HttpService from '../util/HttpService.jsx';

export default class GatewayService {
    // 获取函数列表
    addGateway(param) {
        let url = "reportServer/gateway/addGateway";
        return HttpService.post(url, param);
    }
}
