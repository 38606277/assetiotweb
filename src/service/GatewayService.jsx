import HttpService from '../util/HttpService.jsx';

export default class GatewayService {
    // 添加网关
    addGateway(param) {
        let url = "reportServer/gateway/addGateway";
        return HttpService.post(url, JSON.stringify(param));
    }

    getGatewayList(param) {
        let url = "reportServer/gateway/listEamGateway";
        return HttpService.post(url, JSON.stringify(param));
    }

    deleteGateway(param) {
        let url = "reportServer/gateway/deleteGateway";
        return HttpService.post(url, JSON.stringify(param));
    }
}
