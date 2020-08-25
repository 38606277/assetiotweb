import React from 'react';
import { Table, Form, Input, Divider, Select, Button, Modal, Pagination, Icon, Card, Row, Col, message, Cascader, Upload, Tree } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import AMapLoader from '@amap/amap-jsapi-loader';
import './assetmap.css';
import GatewayService from '../../service/GatewayService.jsx'
import AreaService from '../../service/AreaService.jsx'
import HttpService from '../../util/HttpService.jsx';
import ExportJsonExcel from "js-export-excel";
import './asset.css';

import AssetService from '../../service/AssetService.jsx';
import { each } from 'lodash';
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
  return isJpgOrPng && isLt20M;
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
      merger_name: ''
    };


  }

  //初始化加载调用方法
  async componentDidMount() {
    if (this.state.action == 'update' || this.state.isReadOnly) {
      //加载主表
      await HttpService.post("reportServer/test/gateway/getGatewayById", JSON.stringify({ gateway_id: this.state.id }))
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
      await HttpService.post("reportServer/test/gateway/getGatewayTagList", JSON.stringify({ gateway_id: this.state.id }))
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
        formInfo.address_id = ''
        formInfo.image = ''

        let gateway = {
          gatewayHeader: formInfo,
          gatewayLines: this.state.dataList
        }

        if (this.state.action == 'create') {
          HttpService.post("reportServer/test/gateway/CreateGateway", JSON.stringify(gateway))
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
          HttpService.post("reportServer/test/gateway/UpdateGateway", JSON.stringify(gateway))
            .then(res => {
              if (res.resultCode == "1000") {
                message.success(`保存成功！`)
              }
              else
                message.error(res.message);
            });
        }
        if (closed) {
          window.location.href = "#/asset/gatewayListTest";
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
    console.log("info", info)
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


  checkImage = (rule, value, callback) => {
    return callback();
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

  //导出到Excel
  excel = () => {

    var option = {};
    option.fileName = "网关标签";
    option.datas = [
      {
        sheetData: this.state.dataList,
        sheetName: 'sheet',
        sheetHeader: ['接收时间', '标签号', '电压', '信号强度', '网关编号'],
      }
    ];
    var toExcel = new ExportJsonExcel(option); //new
    toExcel.saveExcel();


  }



  getGatewayStatus = value => {
    if (value == '') {
      message.error('请输入网关编号');
      return;
    }

    HttpService.post("reportServer/test/gateway/queryGatewayStatusByGatewayId", JSON.stringify({ gateway_id: value }))
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
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const { imageUrl } = this.state;

    return (
      <div id="page-wrapper">
        <Card title={<b>{this.state.isReadOnly ? '网关详情' : this.state.action == 'update' ? '编辑网关' : '新建网关'}</b>} bordered={false} extra={<span>
          <Button style={{ marginLeft: '10px' }} onClick={() => this.onSaveClick(true)} disabled={this.state.isReadOnly}>保存并关闭</Button>
          <Button style={{ marginLeft: '10px' }} onClick={() => this.onSaveClick(false)} disabled={this.state.isReadOnly}>保存</Button>
          <Button onClick={() => this.excel()} style={{ marginLeft: '10px' }}>导出</Button>
          <Button href="#/asset/gatewayListTest" style={{ marginLeft: '10px' }}>返回</Button>
        </span>} bodyStyle={{ paddingBottom: '0px' }}>
          <Form >
            <Row>
              <Col xs={24} sm={12}>
                <FormItem {...formItemLayout} label="网关编号">
                  {getFieldDecorator('gateway_id', {
                    rules: [{ required: true, message: '请输入网关编号!' }],
                  })
                    (
                      <Input type='text' readOnly={this.state.isReadOnly} />
                    )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Card>
        <div style={{ padding: '16px' }}>
          <Table dataSource={this.state.dataList} rowSelection={gateway_rowSelection} rowKey={"gateWay_id"} pagination={false} >

            <Column
              title="序号"
              width="100px"
              render={(text, record, index) => `${index + 1}`}
            />
            <Column
              title="物联网标签号"
              dataIndex="tag_id"
            />
            <Column
              title="更新时间"
              dataIndex="receive_time"
            />
            <Column
              title="电压"
              dataIndex="electricity"
            />
            <Column
              title="信号强度"
              dataIndex="signalIntensity"
            />
          </Table>
        </div>
      </div >
    );
  }
}
export default Form.create()(gatewayEdit);