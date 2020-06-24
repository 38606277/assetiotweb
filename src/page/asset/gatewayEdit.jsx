import React from 'react';
import { Table, Form, Input, Divider, Select, Button, Modal, Pagination, Icon, Card, Row, Col, message, Cascader, Upload } from 'antd';
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
const _assetService = new AssetService();

const { Column, ColumnGroup } = Table;
const _areaService = new AreaService();

const { Search } = Input;

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
  return isJpgOrPng && isLt20M;
}


class SelectAddressModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      AMap: null,
      map: null,
      lng: -1,
      lat: -1
    }

  }
  componentDidMount() {
    this.initMap();
  }
  initMap = () => {
    //初始化地图
    AMapLoader.load({
      "key": "38109451268a4a1356c4a3320f251ace",   // 申请好的Web端开发者Key，首次调用 load 时必填
      // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      "plugins": ['AMap.MarkerClusterer']  //插件列表
    }).then((AMap) => {
      console.info('AMap', AMap)
      this.state.AMap = AMap;
      this.state.map = new AMap.Map('mapContainer', {
        center: [114.5220818442, 38.0489583146],
        zoom: 15,
        resizeEnable: true,
      });

      //点击事件
      this.state.map.on('click', function (ev) {
        // 触发事件的对象
        var target = ev.target;
        // 触发事件的地理坐标，AMap.LngLat 类型
        var lnglat = ev.lnglat;
        // 触发事件的像素坐标，AMap.Pixel 类型
        var pixel = ev.pixel;
        // 触发事件类型
        var type = ev.type;

        // this.setState({
        //   lng: lnglat.getLng(),
        //   lat: lnglat.getLat()
        // });

        alert(`点击了：经度${lnglat.getLng()} ,纬度${lnglat.getLat()}`)

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
      enabled: '1',
      confirmDirty: false,
      authtype_id: this.props.match.params.name,
      options: [
        { "level": "1", "label": "北京市", "value": "11", "isLeaf": false },
        { "level": "1", "label": "河北省", "value": "13", "isLeaf": false }
      ],
      pageNum: 1,
      perPage: 10,
      dataList: [],
      assetList: [],
      selectedRowKeys: [],
      selectedRows: [],
      asset_selectedRowKeys: [],
      asset_selectedRows: [],
      loading: false,
      imageUrl: '',
      assetListType: 'assetList', // assetList tagList
    };


  }

  //初始化加载调用方法
  async componentDidMount() {
    if (this.state.action == 'update') {
      //加载主表
      await HttpService.post("reportServer/gateway/getGatewayById", JSON.stringify({ gateway_id: this.state.id }))
        .then(res => {
          if (res.resultCode == "1000") {
            this.props.form.setFieldsValue(res.data);
            this.setState({
              imageUrl: res.data.imageBase64
            })
          }
          else
            message.error(res.message);

        });
      //加班明细表
      await HttpService.post("reportServer/gateway/getGatewayAssetById", JSON.stringify({ gateway_id: this.state.id }))
        .then(res => {
          if (res.resultCode == "1000") {
            this.setState({ dataList: res.data })


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
      this.setState({
        options: response,
      });
    }, errMsg => {
      localStorge.errorTips(errMsg);
    });
  }

  //获取未绑定的资产列表
  loadAssetList() {
    let param = {};
    param.pageNum = this.state.pageNum;
    param.perPage = this.state.perPage;

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
        formInfo.address_id = values.address_array[values.address_array.length - 1];
        formInfo.imageBase64 = this.state.imageUrl;

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
          window.location.href = "#/asset/assetList";
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
    this.state.assetListType = assetListType;
    this.loadAssetList();
    this.setState({
      visible: true,
      assetListType
    });


  };

  handleOk = e => {
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
      targetOption.loading = false;
      targetOption.children = response;
      this.setState({
        options: [...this.state.options],
      });
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



  customRequest() {

  }

  handleChange = info => {
    console.log(info);
    if (info.file.status === 'uploading') {

      getBase64(info.file.originFileObj, imageUrl => {
        console.log(imageUrl)
        this.setState({
          imageUrl,
          loading: false,
        })
      },
      );
      return;
    }

  };

  checkImage = (rule, value, callback) => {
    console.log('checkImage', value)
    if (value || this.state.imageUrl) {
      return callback();
    }
    callback('请选择资产图片!');
  };



  handleAddressOk = e => {
    this.setState({
      visibleAddressModal: false,
    });
  };

  handleAddressCancel = e => {
    console.log(e);
    this.setState({
      visibleAddressModal: false,
    });
  };


  //选择地点
  selectAddress = () => {
    this.setState({
      visibleAddressModal: true,
    });
  }




  render() {

    const asset_rowSelection = {
      selectedRowKeys: this.state.asset_selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ asset_selectedRowKeys: selectedRowKeys, asset_selectedRows: selectedRows });
      },
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
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const { imageUrl } = this.state;

    return (
      <div id="page-wrapper">
        <Card title={<b>编辑网关</b>} bordered={false} extra={<span>
          <Button style={{ marginLeft: '10px' }} onClick={() => this.onSaveClick(true)}>保存并关闭</Button>
          <Button style={{ marginLeft: '10px' }} onClick={() => this.onSaveClick(false)}>保存</Button>
          <Button href="#/asset/gatewayList" style={{ marginLeft: '10px' }}>返回</Button>
        </span>} bodyStyle={{ paddingBottom: '0px' }}>
          <Form >
            <FormItem style={{ display: 'none' }}>
              {getFieldDecorator('asset_id')(
                <Input type='text' />
              )}
            </FormItem>
            <Row>
              <Col xs={24} sm={12}>
                <FormItem {...formItemLayout} label="网关编号">
                  {getFieldDecorator('gateway_id', {
                    rules: [{ required: true, message: '请输入网关编号!' }],
                  })(
                    <Input type='text' />
                  )}
                </FormItem>
              </Col>
              <Col xs={24} sm={12}>
                <FormItem {...formItemLayout} label="地址">
                  {getFieldDecorator('address', {
                    rules: [{ required: true, message: '请输入网关地址' }],
                  })(

                    <Search
                      type='text'
                      enterButton="选择"
                      onSearch={(value) => {
                        this.selectAddress();
                      }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={12}>
                <FormItem {...formItemLayout} label='网关位置' >
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
                </FormItem>

              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={12}>
                <FormItem {...formItemLayout} label="经度">
                  {getFieldDecorator('lng', {
                    rules: [{ required: true, message: '请输入网关编号!' }],
                  })(
                    <Input type='text' />
                  )}
                </FormItem>
              </Col>
              <Col xs={24} sm={12}>
                <FormItem {...formItemLayout} label="纬度">
                  {getFieldDecorator('rng', {
                    rules: [{ required: true, message: '请输入网关地址' }],
                  })(
                    <Input type='text' />
                  )}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col xs={24} sm={12}>

                <FormItem {...formItemLayout} label='网关图片' >

                  {getFieldDecorator('gateway_img', {
                    rules: [{ type: 'object', required: true, message: '请选择网关图片!', validator: this.checkImage }],
                  })(
                    <Upload
                      name="avatar"
                      listType="picture-card"
                      className="avatar-uploader"
                      showUploadList={false}
                      customRequest={this.customRequest}
                      beforeUpload={beforeUpload}
                      onChange={this.handleChange}
                    >
                      {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
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
              <Button style={{ marginLeft: '10px' }} onClick={() => this.showModal('tagList')}>标签新增</Button>
              <Button style={{ marginLeft: '10px' }} onClick={() => this.showModal('assetList')}>资产新增</Button>
              <Button disabled={this.state.selectedRowKeys.length > 0 ? false : true} style={{ marginLeft: '10px' }} onClick={() => this.onDeleteLinesClick()}>删除</Button>
            </span>
          </div>

          <Table dataSource={this.state.dataList} rowSelection={gateway_rowSelection} rowKey={"gateWay_id"} pagination={false} >
            <Column
              title="物联网标签号"
              dataIndex="iot_num"

            />
            <Column
              title="资产名称"
              dataIndex="asset_name"
            />
            <Column
              title="资产编号"
              dataIndex="asset_num"
            />
            <Column
              title="资产地点"
              dataIndex="address"
            />

            <Column
              title="动作"
              render={(text, record) => (
                <span>
                  <a href={`#/asset/GateWayEdit/update/${record.gateWay_id}`}>删除</a>

                </span>
              )}
            />
          </Table>
        </div>
        <Modal
          title="选择资产"
          width="700px"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Table dataSource={this.state.assetList} rowSelection={asset_rowSelection} rowKey={"asset_id"} pagination={false} >
            <Column
              title="资产ID"
              dataIndex="asset_id"

            />
            <Column
              title="物联网标签号"
              dataIndex="iot_num"
            />
            <Column
              title="资产编号"
              dataIndex="asset_num"
            />
            <Column
              title="资产名称"
              dataIndex="asset_name"
            />
          </Table>
          <Pagination current={this.state.pageNum}
            total={this.state.total}
            onChange={(pageNum) => this.onPageNumChange(pageNum)} />

        </Modal>


        <Modal
          title="选择地址"
          width="500px"
          visible={this.state.visibleAddressModal}
          onOk={this.handleAddressOk}
          onCancel={this.handleAddressCancel}
        >
          <SelectAddressModal />

        </Modal>


      </div >
    );
  }
}
export default Form.create()(gatewayEdit);