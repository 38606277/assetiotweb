import React from 'react';
import { Table, Form, Input, Divider, Select, Button, Icon, Card, Row, Col, message, Cascader } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import AssetService from '../../service/AssetService.jsx';
import GatewayService from '../../service/GatewayService.jsx'
import AreaService from '../../service/AreaService.jsx'
import HttpService from '../../util/HttpService.jsx';
import './asset.css';

const { Column, ColumnGroup } = Table;




const _areaService = new AreaService();


export default class assetSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      action: this.props.match.params.action,
      id: this.props.match.params.id,
      enabled: '1',
      confirmDirty: false,
      authtype_id: this.props.match.params.name,
      options: [],
      dataList: []
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
    this.loadAreaData('CHN');

  }



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

  //提交
  onSaveClick(closed) {
    let formInfo = this.props.form.getFieldsValue();
    let gateway = {
      gatewayHeader: formInfo,
      gatewayLines: this.state.dataList

    }
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
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
          HttpService.post("reportServer/asset/UpdateAsset", JSON.stringify(formInfo))
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


  handleConfirmBlur(e) {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }
  openModelClick() {
    alert("dkf");
  }
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


  render() {
    const rowSelection = {
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
                    <Input type='text' />
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

            <FormItem {...tailFormItemLayout}>

            </FormItem>
          </Form>
        </Card>
        <div style={{ padding: '16px' }}>
          <div>
            <span style={{ verticalAlign: 'middle', fontSize: '16px' }}><strong>关联资产</strong></span>
            <span style={{ float: "right", verticalAlign: 'middle' }}>
              <Button style={{ marginLeft: '10px' }} onClick={() => this.onSaveClick(true)}>新增</Button>
              <Button style={{ marginLeft: '10px' }} onClick={() => this.onSaveClick(false)}>删除</Button>
            </span>
          </div>
          <Divider style={{ margin: '16px' }}></Divider>
          <Table dataSource={this.state.dataList} rowSelection={rowSelection} rowKey={"gateWay_id"} pagination={false} >
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
      </div >
    );
  }
}
