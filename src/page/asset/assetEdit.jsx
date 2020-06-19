import React from 'react';
import { Form, Input, Select, Button, Icon, Card, Row, Col, message } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import AssetService from '../../service/AssetService.jsx';
import HttpService from '../../util/HttpService.jsx';


class assetEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      action: this.props.match.params.action,
      id: this.props.match.params.id,
      enabled: '1',
    };


  }

  //初始化加载调用方法
  componentDidMount() {
    if (this.state.action == 'update') {
      HttpService.post("reportServer/asset/getAssetById", JSON.stringify({ asset_id: this.state.id }))
        .then(res => {
          if (res.resultCode == "1000") {
            this.props.form.setFieldsValue(res.data);
          }
          else
            message.error(res.message);

        });
    }

  }

  //提交
  onSaveClick(closed) {
    let formInfo = this.props.form.getFieldsValue();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (this.state.action == 'create') {
          HttpService.post("reportServer/asset/CreateAsset", JSON.stringify(formInfo))
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


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
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
        <Card title={<b>{this.state._id == 'null' ? '新建资产标签' : '编辑资产标签'}</b>}
          extra={<span>
            <Button style={{ marginLeft: '10px' }} onClick={() => this.onSaveClick(true)}>保存并关闭</Button>
            <Button style={{ marginLeft: '10px' }} onClick={() => this.onSaveClick(false)}>保存</Button>
            <Button href="#/asset/assetList" style={{ marginLeft: '10px' }}>返回</Button>
          </span>} >
          <Form >
            <FormItem style={{ display: 'none' }}>
              {getFieldDecorator('asset_id')(
                <Input type='text' />
              )}
            </FormItem>
            <Row>
              <Col xs={24} sm={12}>
                <FormItem {...formItemLayout} label="物联网编号">
                  {getFieldDecorator('iot_num', {
                    rules: [{ required: true, message: '请输入物联网标签号!' }],
                  })(
                    <Input type='text' />
                  )}
                </FormItem>
              </Col>
              <Col xs={24} sm={12}>
                <FormItem {...formItemLayout} label="资产编号">
                  {getFieldDecorator('asset_num', {
                    rules: [{ required: true, message: '请输入资产编号!' }],
                  })(
                    <Input type='text' addonAfter={<Icon type="setting" onClick={e => this.openModelClick()} />} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={12}>
                <FormItem {...formItemLayout} label="资产名称">
                  {getFieldDecorator('asset_name', {
                    rules: [{ required: true, message: '请输入角色名称!' }],
                  })(
                    <Input type='text' />
                  )}
                </FormItem>
              </Col>
              <Col xs={24} sm={12}>
                <FormItem {...formItemLayout} label='创建人' >
                  <Select name='enabled' value={this.state.enabled.toString()} style={{ width: 120 }} onChange={(value) => this.onSelectChange('enabled', value)}>
                    <Option value='1' >启用</Option>
                    <Option value='0' >禁用</Option>

                  </Select>

                </FormItem>
              </Col>
            </Row>


          </Form>
        </Card>
      </div>
    );
  }
}
export default Form.create()(assetEdit);