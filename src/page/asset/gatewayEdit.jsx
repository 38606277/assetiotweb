import React from 'react';
import { Form, Icon as LegacyIcon } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Table,
  Input,
  Divider,
  Select,
  Button,
  Modal,
  Pagination,
  Card,
  Row,
  Col,
  message,
  Cascader,
  Upload,
  Tree,
} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import AMapLoader from '@amap/amap-jsapi-loader';
import './assetmap.css';
import GatewayService from '../../service/GatewayService.jsx'
import AreaService from '../../service/AreaService.jsx'
import HttpService from '../../util/HttpService.jsx';
import './asset.css';

import AssetService from '../../service/AssetService.jsx';
import { each } from 'lodash';

import { imageCompress } from '../../js/ImageUtils.js'


const _assetService = new AssetService();

const { Column, ColumnGroup } = Table;
const _areaService = new AreaService();

const { Search } = Input;
const { TreeNode } = Tree;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt20M = file.size / 1024 / 1024 < 20;
  if (!isLt20M) {
    message.error('Image must smaller than 20MB!');
  }

  console.log('beforeUpload - ', file)
  return isJpgOrPng && isLt20M;
}

class SelectAreaModal extends React.Component {
  constructor(props) {
    super(props);
    console.log('SelectAreaModal', props)
    this.state = {
      treeData: [
        { "level": "1", "label": "北京市", "value": "11", "isLeaf": false },
        { "level": "1", "label": "河北省", "value": "13", "isLeaf": false }
      ],
      handleAreaOk: props.handleAreaOk,
      handleAreaCancel: props.handleAreaCancel,
      areaInfo: {
        areaId: props.address_id ? props.address_id : '',
        areaName: props.merger_name ? props.merger_name : '',
      }
    }
  }
  loadAreaData(code) {
    let param = {
      parentCode: code,
      maxLevel: 3
    }
    _areaService.getArea(param).then(response => {

      if (response.resultCode == "1000") {
        this.setState({
          treeData: response,
        });
      }
      else {
        message.error(response.message);
      }
    }, errMsg => {
      localStorge.errorTips(errMsg);
    });
  }

  onLoadData = treeNode =>
    new Promise(resolve => {
      if (treeNode.props.children) {
        resolve();
        return;
      }
      let maxLevel = 3
      console.log(treeNode);
      let param = {
        parentCode: treeNode.props.dataRef.value,
        maxLevel: maxLevel
      }
      _areaService.getArea(param).then(response => {

        if (response.resultCode == "1000") {
          treeNode.props.dataRef.children = response.data;
          this.setState({
            treeData: [...this.state.treeData],
          });
          resolve();
        }
        else {
          message.error(response.message);
        }


      }, errMsg => {
        localStorge.errorTips(errMsg);
      });

    });

  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.label} key={item.value} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.value} title={item.label} {...item} dataRef={item} />;
    });

  onSelect = (selectedKeys, info) => {
    if (info.node.props.dataRef.isLeaf) {
      this.setState({
        areaInfo: {
          address_id: info.node.props.dataRef.value,
          merger_name: info.node.props.dataRef.merger_name
        },
      })
    }

  };
  render() {
    return (
      <Modal
        title={this.state.areaInfo.merger_name ? `选择网关位置 ${this.state.areaInfo.merger_name}` : '选择网关位置'}
        width="700px"
        height="300px"
        visible={this.props.visible}
        onOk={() => this.state.handleAreaOk(this.state.areaInfo)}
        onCancel={this.state.handleAreaCancel}>
        <Tree style={{ height: '400px', overflow: 'auto' }} loadData={this.onLoadData} onSelect={this.onSelect}>{this.renderTreeNodes(this.state.treeData)}</Tree>
      </Modal>
    )
  }

}

class SelectAddressModal extends React.Component {
  constructor(props) {
    super(props);
    console.log('props', props);
    this.state = {
      AMap: null,
      map: null,
      lng: props.lng ? props.lng : -1,
      lat: props.lat ? props.lat : -1,
      onSelectAddress: props.onSelectAddress,
    }

  }
  componentDidMount() {
    this.initMap();
  }


  regeoCode(AMap, lnglat) {
    let _this = this
    this.state.map.clearMap();
    let marker = new AMap.Marker({
      position: new AMap.LngLat(lnglat.getLng(), lnglat.getLat()),   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
    });

    this.state.map.add(marker);

    let geocoder = new AMap.Geocoder({
      // city: "010", //城市设为北京，默认：“全国”
      // radius: 1000 //范围，默认：500
    });
    var mlnglat = [lnglat.getLng(), lnglat.getLat()];
    geocoder.getAddress(mlnglat, function (status, result) {
      console.log('status', status)
      console.log('result', result)
      if (status === 'complete' && result.regeocode) {
        var address = result.regeocode.formattedAddress;
        lnglat.address = address;
        _this.state.onSelectAddress(lnglat);
      } else {
        lnglat.address = '根据经纬度查询地址失败';
        _this.state.onSelectAddress(lnglat);

      }
    });
  }

  initMap = () => {
    let _this = this;
    //初始化地图
    AMapLoader.load({
      "key": "034f37e988d8a97079766539387a6a0b",   // 申请好的Web端开发者Key，首次调用 load 时必填
      // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      "plugins": ['AMap.MarkerClusterer', 'AMap.Geocoder']  //插件列表
    }).then((AMap) => {
      console.info('AMap', AMap)
      _this.state.AMap = AMap;

      let mapConfig = {
        zoom: 15,
        resizeEnable: true,
      }
      if (!(_this.state.lng == -1 && _this.state.lat == -1)) {
        mapConfig.center = [_this.state.lng, _this.state.lat]
      }

      _this.state.map = new AMap.Map('mapContainer', mapConfig);

      //点击事件
      _this.state.map.on('click', function (ev) {

        // 触发事件的对象
        var target = ev.target;
        // 触发事件的地理坐标，AMap.LngLat 类型
        var lnglat = ev.lnglat;
        // 触发事件的像素坐标，AMap.Pixel 类型
        var pixel = ev.pixel;
        // 触发事件类型
        var type = ev.type;
        // _this.setState({
        //   lng: lnglat.getLng(),
        //   lat: lnglat.getLat()
        // });

        _this.regeoCode(AMap, lnglat);

        //alert(`点击了：经度${lnglat.getLng()} ,纬度${lnglat.getLat()}`)

      });

    }).catch(e => {
      console.log(e);
    })
  }

  render() {
    return (
      <div id="mapContainer" style={{ height: '400px' }}></div>
    )
  }

}


class gatewayEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      action: this.props.match.params.action,
      id: this.props.match.params.id,
      isReadOnly: this.props.match.params.action == 'readOnly',
      enabled: '1',
      confirmDirty: false,
      authtype_id: this.props.match.params.name,
      options: [
        { "level": "1", "label": "北京市", "value": "11", "isLeaf": false },
        { "level": "1", "label": "河北省", "value": "13", "isLeaf": false }
      ],
      pageNum: 1,
      perPage: 5,
      dataList: [],
      assetList: [],
      selectedRowKeys: [],
      selectedRows: [],
      asset_selectedRowKeys: [],
      asset_selectedRows: [],
      loading: false,
      imageUrl: '',
      assetListType: 'assetList', // assetList tagList
      selectLng: -1,//选择的经度
      selectLat: -1, //选择的纬度
      selectAddress: '',
      visibleAreaModal: false,
      address_id: '',
      merger_name: '',
      isAuto: '1' //自动获取
    };


  }

  //初始化加载调用方法
  async componentDidMount() {
    if (this.state.action == 'update' || this.state.isReadOnly) {
      //加载主表
      await HttpService.post("reportServer/gateway/getGatewayById", JSON.stringify({ gateway_id: this.state.id }))
        .then(res => {
          if (res.resultCode == "1000") {
            this.props.form.setFieldsValue(res.data);
            this.setState({
              imageUrl: res.data.image,
              address_id: res.data.address_id,
              merger_name: res.data.merger_name,
            })
          }
          else
            message.error(res.message);
        });
      //加载明细表
      await HttpService.post("reportServer/gateway/getGatewayAssetById", JSON.stringify({ gateway_id: this.state.id }))
        .then(res => {
          if (res.resultCode == "1000") {
            this.setState({ dataList: res.data, asset_selectedRows: res.data })
          }
          else
            message.error(res.message);

        });

    }
  }


  //加载区域数据
  loadAreaData(code) {
    let param = {
      parentCode: code,
      maxLevel: 3
    }
    _areaService.getArea(param).then(response => {

      if (response.resultCode == "1000") {
        this.setState({
          options: response.data,
        });

      }
      else {
        message.error(response.message);
      }

    }, errMsg => {
      localStorge.errorTips(errMsg);
    });
  }

  // 页数发生变化的时候
  onPageNumChange(pageNum) {
    this.setState({
      pageNum: pageNum
    }, () => {
      this.loadAssetList();
    });
  }

  //获取未绑定的资产列表
  loadAssetList() {
    let param = {};
    param.pageNum = this.state.pageNum;
    param.perPage = this.state.perPage;
    param.gateway_id = this.props.form.getFieldValue('gateway_id')
    let url = this.state.assetListType == 'assetList' ? "reportServer/asset/listAssetNoBindGateway" : "reportServer/asset/listTagNoBindGateway"

    HttpService.post(url, JSON.stringify(param))
      .then(res => {
        this.setState({
          assetList: res.data.list,
          total: res.data.total
        });
      });

  }



  //提交
  onSaveClick(closed) {

    this.props.form.validateFieldsAndScroll((err, values) => {

      if (!err) {

        let formInfo = this.props.form.getFieldsValue();
        console.log("提交数据", formInfo);
        //添加位置id 位置名称
        formInfo.address_id = this.state.address_id
        formInfo.image = this.state.imageUrl;

        let gateway = {
          gatewayHeader: formInfo,
          gatewayLines: this.state.dataList
        }

        if (this.state.action == 'create') {
          HttpService.post("reportServer/gateway/CreateGateway", JSON.stringify(gateway))
            .then(res => {
              if (res.resultCode == "1000") {
                message.success('创建成功！id号：' + res.data);
                this.setState({ action: 'update' });
                this.props.form.setFieldsValue({ asset_id: res.data });
              }
              else
                message.error(res.message);

            });

        } else if (this.state.action == 'update') {
          HttpService.post("reportServer/gateway/UpdateGateway", JSON.stringify(gateway))
            .then(res => {
              if (res.resultCode == "1000") {
                message.success(`保存成功！`)
              }
              else
                message.error(res.message);
            });
        }
        if (closed) {
          window.location.href = "#/asset/gatewayList";
        }
      }
    });
  }

  onDeleteLinesClick() {
    this.state.selectedRows.forEach(element => {
      let index = this.state.dataList.indexOf(element);
      this.state.dataList.splice(index, 1);

    });
    let newDataList = this.state.dataList;
    this.setState({ dataList: newDataList, selectedRowKeys: [], selectedRows: [] });

  }

  handleConfirmBlur(e) {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }
  openModelClick() {
    alert("dkf");
  }

  showModal = (assetListType) => {
    //类型不同则需要由第一页加载
    if (this.state.assetListType != assetListType) {
      this.state.pageNum = 1;
    }
    this.state.assetListType = assetListType;
    this.loadAssetList();
    this.setState({
      visible: true,
      assetListType
    });


  };

  handleOk = e => {
    this.state.dataList = [];
    this.state.asset_selectedRows.forEach(element => {
      this.state.dataList.push(element);
    });
    this.setState({})

    console.log(e);
    this.setState({
      visible: false,
    });
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };


  onChange = (value, selectedOptions) => {
    console.log(value, selectedOptions);
  };


  loadData = selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;

    let param = {
      parentCode: targetOption.value,
      maxLevel: 3
    }
    _areaService.getArea(param).then(response => {

      if (response.resultCode == "1000") {
        targetOption.loading = false;
        targetOption.children = response.data;
        this.setState({
          options: [...this.state.options],
        });

      }
      else {
        message.error(response.message);
      }
    }, errMsg => {
      localStorge.errorTips(errMsg);
    });
  };

  handleSelectChange = value => {
    console.log(value);
    this.props.form.setFieldsValue({
      scanInterval: value,
    });
  };



  handleChange = info => {
    console.log("handleChange - info", info)
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      if (info.file.response.resultCode == '1000') {
        // Get this url from response in real world.
        this.setState({
          imageUrl: info.file.response.data.fileName,
          loading: false,
        });
      }
    } else {
      message.error(info.file.response.message);
      this.setState({
        loading: false,
      });
    }
  }

  //压缩
  transformFile = (file) => {
    console.log('transformFile - file', file)
    return new Promise(resolve => {
      // eslint-disable-next-line no-undef
      imageCompress(file, (50 * 1024)).then(blob => {
        let newFile = new File([blob], file.name);
        console.log('newFile - ', newFile)
        resolve(newFile);
      })
    });
  }


  // handleChange = info => {
  //   console.log(info);
  //   if (info.file.status === 'uploading') {

  //     getBase64(info.file.originFileObj, imageUrl => {
  //       console.log(imageUrl)
  //       this.setState({
  //         imageUrl,
  //         loading: false,
  //       })
  //     },
  //     );
  //     return;
  //   }

  // };

  checkImage = (rule, value, callback) => {
    return callback();

    // console.log('checkImage', value)
    // if (value || this.state.imageUrl) {
    //   return callback();
    // }
    // callback('请选择资产图片!');
  };


  handleAddressOk = e => {
    this.setState({
      visibleAddressModal: false,
    });

    this.props.form.setFieldsValue({
      lng: this.state.selectLng,
      rng: this.state.selectLat,
      address: this.state.selectAddress
    });

  };

  handleAddressCancel = e => {
    console.log(e);
    this.setState({
      visibleAddressModal: false,
    });
  };


  //选择地点
  showSelectAddress = () => {
    this.setState({
      visibleAddressModal: true,
    });
  }

  onSelectAddress(lnglat) {
    this.setState({
      selectLng: lnglat.getLng(),
      selectLat: lnglat.getLat(),
      selectAddress: lnglat.address
    });
  }


  showSelectArea = () => {
    console.log('showSelectArea')
    this.setState({
      visibleAreaModal: true,
    });
  }

  handleAreaOk = (areaInfo) => {
    console.log('areaInfo', areaInfo)
    this.props.form.setFieldsValue({
      merger_name: areaInfo.merger_name
    });

    this.setState({
      visibleAreaModal: false,
      merger_name: areaInfo.merger_name,
      address_id: areaInfo.address_id
    });
  };

  handleAreaCancel = e => {
    console.log(e);
    this.setState({
      visibleAreaModal: false,
    });
  };


  getGatewayStatus = value => {
    if (value == '') {
      message.error('请输入网关编号');
      return;
    }

    HttpService.post("reportServer/gateway/queryGatewayStatusByGatewayId", JSON.stringify({ gateway_id: value }))
      .then(res => {
        if (res.resultCode == "1000") {
          this.setState({
            merger_name: res.data.merger_name,
            address_id: res.data.code
          });
          this.props.form.setFieldsValue(res.data);
          console.log("网关状态", res)
        }
        else
          message.error(res.message);
      });

  }

  removeAssetSelectedRowsByAssetId(asset_id) {
    for (let i in this.state.asset_selectedRows) {
      if (this.state.asset_selectedRows[i].asset_id == asset_id) {
        this.state.asset_selectedRows.splice(i, 1)
        break;
      }
    }
  }

  handlePreviewCancel = () => this.setState({ previewVisible: false });

  handlePreview = imageName => {
    this.setState({
      previewImage: `${window.getServerUrl()}reportServer/uploadAssetImg/downloadAssetImg?fileName=${imageName}`,
      previewVisible: true,
    });
  };

  //编辑字段对应值
  onSelectChange(name, value) {
    this.setState({ [name]: value });
    this.props.form.setFieldsValue({ [name]: value });
  }



  isDisabled() {
    if (this.state.isReadOnly) { //只读为true  则无需控制Disabled属性默认为false
      return false;
    }
    let isAuto = this.state.isAuto == '1'; //自动获取 disable为true
    return isAuto;
  }


  render() {

    const asset_rowSelection = {
      selectedRowKeys: this.state.asset_selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        //this.setState({ asset_selectedRowKeys: selectedRowKeys, asset_selectedRows: selectedRows });
        this.setState({ asset_selectedRowKeys: selectedRowKeys });
      },
      //选择操作
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        if (selected) {
          console.log('onSelect 添加', record);
          this.state.asset_selectedRows.push(record)
        } else {
          this.removeAssetSelectedRowsByAssetId(record.asset_id)
          console.log('onSelect 移除', record);
        }
        //  console.log('onSelect', record, selected, selectedRows, nativeEvent);
      },
      //全选
      onSelectAll: (selected, selectedRows, changeRows) => {
        if (selected) {
          for (let i in changeRows) {
            this.state.asset_selectedRows.push(changeRows[i])
          }

          console.log('onSelectAll 添加', changeRows);
        } else {

          for (let i in changeRows) {
            this.removeAssetSelectedRowsByAssetId(changeRows[i].asset_id)
          }
          console.log('onSelectAll 移除', changeRows);
        }


        console.log('onSelectAll', selected, selectedRows, changeRows);
      },
      //反全选
      // onSelectInvert: (selectedRows) => {
      //   console.log('onSelectInvert', selectedRows);
      // }
    };

    const gateway_rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys: selectedRowKeys, selectedRows: selectedRows });
      },
    };

    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };
    const uploadButton = (
      <div>
        <LegacyIcon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const { imageUrl } = this.state;

    return (
      <div id="page-wrapper">
        <Card title={<b>{this.state.isReadOnly ? '网关详情' : this.state.action == 'update' ? '编辑网关' : '新建网关'}</b>} bordered={false} extra={<span>
          <Button style={{ marginLeft: '10px' }} onClick={() => this.onSaveClick(true)} disabled={this.state.isReadOnly}>保存并关闭</Button>
          <Button style={{ marginLeft: '10px' }} onClick={() => this.onSaveClick(false)} disabled={this.state.isReadOnly}>保存</Button>
          <Button href="#/asset/gatewayList" style={{ marginLeft: '10px' }}>返回</Button>
        </span>} bodyStyle={{ paddingBottom: '0px' }}>
          <Form >
            <FormItem style={{ display: 'none' }}>
              {getFieldDecorator('asset_id')(
                <Input type='text' readOnly={this.state.isReadOnly} />
              )}
            </FormItem>
            <Row>
              <Col xs={24} sm={12}>
                <FormItem {...formItemLayout} label="网关编号">
                  {getFieldDecorator('gateway_id', {
                    rules: [{ required: true, message: '请输入网关编号' }],
                  })
                    (
                      <Search
                        type='text'
                        enterButton={(<Button type="primary" disabled={this.state.isReadOnly || this.isDisabled()} >获取位置</Button>)}
                        onSearch={(value) => {
                          this.getGatewayStatus(value);
                        }}
                        readOnly={this.state.isReadOnly}
                      />
                    )}
                </FormItem>
              </Col>


              <Col xs={24} sm={12}>
                <FormItem {...formItemLayout} label='自动初始化' >
                  <Select name='isAuto' value={this.state.isAuto.toString()} style={{ width: 120 }} disabled={this.state.isReadOnly} onChange={(value) => this.onSelectChange('isAuto', value)}>
                    <Option value='1' >是</Option>
                    <Option value='0' >否</Option>
                  </Select>
                </FormItem>
              </Col>

            </Row>
            <Row>


              <Col xs={24} sm={12}>
                <FormItem {...formItemLayout} label="地址">
                  {getFieldDecorator('address', {
                    rules: [{ required: false, message: '请输入网关地址' }],
                  })(

                    <Search
                      type='text'
                      enterButton={(<Button type="primary" disabled={this.state.isReadOnly || this.isDisabled()} >选择</Button>)}
                      onSearch={(value) => {
                        this.showSelectAddress();
                      }}
                      readOnly={this.state.isReadOnly}
                      disabled={this.isDisabled()}
                    />
                  )}
                </FormItem>
              </Col>

              <Col xs={24} sm={12}>

                <FormItem {...formItemLayout} label="网关位置">
                  {getFieldDecorator('merger_name', {
                    rules: [{ required: false, message: '请选择网关位置' }],
                  })(
                    <Search
                      readOnly
                      type='text'
                      enterButton={(<Button type="primary" disabled={this.state.isReadOnly || this.isDisabled()} >选择</Button>)}
                      onSearch={(value) => {
                        this.showSelectArea();
                      }}
                      readOnly={this.state.isReadOnly}
                      disabled={this.isDisabled()}
                    />
                  )}
                </FormItem>



                {/* <FormItem {...formItemLayout} label='网关位置' >
                  {getFieldDecorator('address_array', {
                    rules: [
                      { type: 'array', required: true, message: '请选择网关位置' },
                    ],
                  })(<Cascader
                    options={this.state.options}
                    loadData={this.loadData}
                    onChange={this.onChange}
                    changeOnSelect
                    placeholde="请选择"
                  />)}
                </FormItem> */}

              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={12}>
                <FormItem {...formItemLayout} label="经度">
                  {getFieldDecorator('lng', {
                    rules: [{ required: false, message: '请输入网关经度!' }],
                  })(
                    <Input type='text' disabled={this.isDisabled()} readOnly={this.state.isReadOnly} />
                  )}
                </FormItem>
              </Col>
              <Col xs={24} sm={12}>
                <FormItem {...formItemLayout} label="纬度">
                  {getFieldDecorator('rng', {
                    rules: [{ required: false, message: '请输入网关纬度' }],
                  })(
                    <Input type='text' disabled={this.isDisabled()} readOnly={this.state.isReadOnly} />
                  )}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col xs={24} sm={12}>

                <FormItem {...formItemLayout} label='网关图片' >

                  {getFieldDecorator('gateway_img', {
                    rules: [{ type: 'object', required: false, message: '请选择网关图片', validator: this.checkImage }],
                  })(
                    <Upload
                      name="file"
                      listType="picture-card"
                      className="avatar-uploader"
                      showUploadList={false}
                      action={`${window.getServerUrl()}reportServer/uploadAssetImg/uploadAssetImg`}
                      beforeUpload={beforeUpload}
                      onChange={this.handleChange}
                      disabled={this.state.isReadOnly}
                    // 图片压缩 transformFile={this.transformFile}
                    >

                      {imageUrl ? < img src={`${window.getServerUrl()}reportServer/uploadAssetImg/downloadAssetImg?fileName=thumbnail_${imageUrl}`} alt="avatar" style={{ width: '100%' }} /> : uploadButton}

                    </Upload>
                  )}

                </FormItem>
              </Col>
            </Row>
          </Form>
        </Card>
        <div style={{ padding: '16px' }}>
          <div style={{ paddingBottom: '16px' }}>
            <span style={{ verticalAlign: 'middle', fontSize: '16px' }}><strong>关联资产</strong></span>
            <span style={{ float: "right", verticalAlign: 'middle' }}>
              <Button style={{ marginLeft: '10px' }} onClick={() => this.showModal('tagList')} disabled={this.state.isReadOnly}>标签新增</Button>
              <Button style={{ marginLeft: '10px' }} onClick={() => this.showModal('assetList')} disabled={this.state.isReadOnly}>资产新增</Button>
              <Button disabled={this.state.selectedRowKeys.length > 0 ? false : true} style={{ marginLeft: '10px' }} onClick={() => this.onDeleteLinesClick()} disabled={this.state.isReadOnly}>删除</Button>
            </span>
          </div>

          <Table dataSource={this.state.dataList} rowSelection={gateway_rowSelection} rowKey={"gateWay_id"} pagination={false} >
            <Column
              title="资产图片"
              render={(text, record) => (
                <span>
                  <img onClick={() => this.handlePreview(record.image)} style={{ width: '50px', height: '50px' }} src={`${window.getServerUrl()}reportServer/uploadAssetImg/downloadAssetImg?fileName=thumbnail_${record.image}`} />
                </span>
              )}
            />
            <Column
              title="物联网标签号"
              dataIndex="iot_num"

            />
            <Column
              title="资产名称"
              dataIndex="asset_name"
            />
            <Column
              title="资产标签号"
              dataIndex="asset_tag"
            />
            <Column
              title="资产地点"
              dataIndex="address"
            />
          </Table>
        </div>
        <Modal
          title="选择资产"
          width="800px"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Table dataSource={this.state.assetList} rowSelection={asset_rowSelection} rowKey={"asset_id"} pagination={false} >
            {/* <Column
              title="资产ID"
              dataIndex="asset_id"

            /> */}
            <Column
              title="资产图片"
              render={(text, record) => (
                <span>
                  <img onClick={() => this.handlePreview(record.image)} style={{ width: '50px', height: '50px' }} src={`${window.getServerUrl()}reportServer/uploadAssetImg/downloadAssetImg?fileName=thumbnail_${record.image}`} />
                </span>
              )}
            />
            <Column
              title="物联网标签号"
              dataIndex="iot_num"
            />
            <Column
              title="资产标签号"
              dataIndex="asset_tag"
            />
            <Column
              title="资产名称"
              dataIndex="asset_name"
            />
          </Table>
          <Pagination current={this.state.pageNum}
            total={this.state.total}
            defaultPageSize={this.state.perPage}
            onChange={(pageNum) => this.onPageNumChange(pageNum)} />

        </Modal>


        <Modal
          title={`选择地址(${this.state.selectLng},${this.state.selectLat},${this.state.selectAddress})`}
          width="500px"
          visible={this.state.visibleAddressModal}
          onOk={this.handleAddressOk}
          onCancel={this.handleAddressCancel}
        >
          <SelectAddressModal
            onSelectAddress={(lnglat) => this.onSelectAddress(lnglat)} />

        </Modal>

        <SelectAreaModal
          visible={this.state.visibleAreaModal}
          handleAreaOk={this.handleAreaOk}
          handleAreaCancel={this.handleAreaCancel}
          address_id={this.state.address_id}
          merger_name={this.state.merger_name}
        />、

        <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handlePreviewCancel}>
          <img alt="图片" style={{ width: '100%' }} src={this.state.previewImage} />
        </Modal>


      </div >
    );
  }
}
export default Form.create()(gatewayEdit);