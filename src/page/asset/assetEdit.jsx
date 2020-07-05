import React from 'react';
import { Form, Input, Select, Button, Icon, Card, Row, Col, message, Upload, Divider } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import AssetService from '../../service/AssetService.jsx';
import HttpService from '../../util/HttpService.jsx';


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


class assetEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      action: this.props.match.params.action,
      id: this.props.match.params.id,
      enabled: '1',
      loading: false,
      imageUrl: ''
    };


  }

  //初始化加载调用方法
  componentDidMount() {
    if (this.state.action == 'update') {
      HttpService.post("reportServer/asset/getAssetById", JSON.stringify({ asset_tag: this.state.id }))
        .then(res => {
          if (res.resultCode == "1000") {
            this.props.form.setFieldsValue(res.data);
            this.setState({
              imageUrl: res.data.image
            })
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

        console.log("提交数据", formInfo);

        formInfo.image = this.state.imageUrl;

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
          formInfo.asset_id = this.state.id;
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

  customRequest() {

  }

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
    // if (value || this.state.imageUrl) {
    //   return callback();
    // }
    // callback('请选择资产图片!');
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 12 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
      },
    };
    const formItemLayout1 = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
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
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label="物联网编号">
                  {getFieldDecorator('iot_num', {
                    rules: [{ required: true, message: '请输入物联网标签号!' }],
                  })(
                    <Input type='text' />
                  )}
                </FormItem>
              </Col>
              
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label="资产标签号">
                  {getFieldDecorator('asset_tag', {
                    rules: [{ required: true, message: '请输入资产名称!' }],
                  })(
                    <Input type='text' />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24}>
                <FormItem {...formItemLayout1} label='资产名称' >
                  {getFieldDecorator('asset_name', {
                    rules: [{ required: true, message: '请输入资产名称!' }],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='资产类别编码' >
                  {getFieldDecorator('typeCode', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='资产类别描述' >
                  {getFieldDecorator('typeName', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='生产厂商' >
                  {getFieldDecorator('productor', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='规格型号' >
                  {getFieldDecorator('model', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='数量' >
                  {getFieldDecorator('amount', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
            </Row>
            <Divider orientation="left">使用信息</Divider>
            <Row>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='启用日期' >
                  {getFieldDecorator('startDate', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='折旧年限' >
                  {getFieldDecorator('lifeInYears', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='剩余折旧月数' >
                  {getFieldDecorator('lifeInMonth', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='责任部门' >
                  {getFieldDecorator('dutyDeptName', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>

              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label="责任人编码">
                  {getFieldDecorator('dutyCode', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}
                </FormItem>
              </Col>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='责任人' >
                  {getFieldDecorator('dutyName', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='使用部门' >
                  {getFieldDecorator('useDeptName', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>

              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label="使用编码">
                  {getFieldDecorator('userCode', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}
                </FormItem>
              </Col>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='使用人' >
                  {getFieldDecorator('userName', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='资产地点编号' >
                  {getFieldDecorator('addressCode', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
              <Divider orientation="left">财务信息</Divider>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label="资产地点描述">
                  {getFieldDecorator('addressName', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}
                </FormItem>
              </Col>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='原值' >
                  {getFieldDecorator('cost', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>

            </Row>
            <Row>


              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label="净值">
                  {getFieldDecorator('netValue', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}
                </FormItem>
              </Col>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='净额' >
                  {getFieldDecorator('netQuota', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='残值' >
                  {getFieldDecorator('residualValue', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
            </Row>
            <Row>

              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='本期折旧' >
                  {getFieldDecorator('periodDepreciation', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>


              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label="本年折旧">
                  {getFieldDecorator('yearDepreciation', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}
                </FormItem>
              </Col>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='累计折旧' >
                  {getFieldDecorator('cumulativeDepreciation', {

                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='本期减值' >
                  {getFieldDecorator('periodImpairment', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>

              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='本年减值'>
                  {getFieldDecorator('yearImpairment', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}
                </FormItem>
              </Col>
              <Col xs={24} sm={8}>
                <FormItem {...formItemLayout} label='累计减值' >
                  {getFieldDecorator('cumulativeImpairment', {
                    rules: [{}],
                  })(
                    <Input type='text' />
                  )}

                </FormItem>
              </Col>
            </Row>




            <Row>
              <Col xs={24} sm={24}>

                <FormItem {...formItemLayout1} label='资产图片' >

                  {getFieldDecorator('asset_img', {
                    rules: [{ type: 'object', required: false, message: '请选择资产图片!', validator: this.checkImage }],
                  })(
                    <Upload
                      name="file"
                      listType="picture-card"
                      className="avatar-uploader"
                      showUploadList={false}
                      action="http://127.0.0.1/reportServer/uploadAssetImg/uploadAssetImg"
                      beforeUpload={beforeUpload}
                      onChange={this.handleChange}
                    >

                      {imageUrl ? < img src={`http://127.0.0.1/reportServer/uploadAssetImg/downloadAssetImg?fileName=${imageUrl}`} alt="avatar" style={{ width: '100%' }} /> : uploadButton}

                    </Upload>
                  )}

                </FormItem>


              </Col>
            </Row>
          </Form>
        </Card >
      </div >
    );
  }
}
export default Form.create()(assetEdit);