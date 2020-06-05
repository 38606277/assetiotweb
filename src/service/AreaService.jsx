import HttpService from '../util/HttpService.jsx';

export default class AreaService {
    // 添加网关
    getArea(param) {
        let url = "/reportServer/area/getArea";
        return HttpService.post(url, JSON.stringify(param));
    }
}
