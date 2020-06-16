import HttpService from '../util/HttpService.jsx';

export default class AssetService {
    // 添加资产
    static addAsset(param) {
        let url = "reportServer/asset/addAsset";
        return HttpService.post(url, JSON.stringify(param));
    }

    //获取资产列表
    getAssetList(param) {
        let url = "reportServer/asset/listEamAsset";
        return HttpService.post(url, JSON.stringify(param));
    }

    //获取资产列表
    getBindingAssetList(param) {
        let url = "reportServer/asset/listBindingEamAsset";
        return HttpService.post(url, JSON.stringify(param));
    }

    //删除资产
    deleteAsset(param) {
        let url = "reportServer/asset/deleteAsset";
        return HttpService.post(url, JSON.stringify(param));
    }

    //绑定物联网标签
    bindEamTag(param) {
        let url = "reportServer/asset/bindEamTag";
        return HttpService.post(url, JSON.stringify(param));
    }

    //获取网关下的资产
    getEamAssetListByGatewayId(param) {
        let url = "reportServer/asset/listEamAssetByGatewayId";
        return HttpService.post(url, JSON.stringify(param));
    }

}
