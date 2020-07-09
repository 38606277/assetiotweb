import React from 'react';
import { Form, Input, Select, Button, Card, Row, Col, Tree, message } from 'antd';
import LocalStorge from '../../../util/LogcalStorge.jsx';
import HttpService from '../../../util/HttpService.jsx';
// import EditableTree from './EditableTree.js';
const localStorge = new LocalStorge();
const FormItem = Form.Item;
const { TreeNode } = Tree;

class OrgManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      action: 'create',
      treeData: [],
      selectedKeys: ["2"],
      expandedKeys: [2],
      autoExpandParent: true,



    };
  }

  componentDidMount() {
    //this.loadOrgData('0');
    this.getOrgTree();
  }

  getOrgTree() {
    HttpService.post('reportServer/org/getOrgTree', JSON.stringify({}))
      .then(res => {
        if (res.resultCode == "1000") {
          this.setState({ treeData: res.data });
        }
        else {
          message.error(res.message);
        }
      });

  }




  loadOrgData(org_pid) {
    let param = {
      org_pid: org_pid,
    }
    HttpService.post('reportServer/org/listOrgTreeByOrgPid', JSON.stringify(param))
      .then(res => {
        if (res.resultCode == "1000") {
          this.setState({
            treeData: res.data,
          });
          if (0 < res.data.length) {
            this.setState({
              action: 'edit'
            })
            this.props.form.setFieldsValue(res.data[0]);
          } else {
            this.props.form.setFieldsValue({ org_pid: 0 });
          }

        }
        else {
          message.error(res.message);
        }

      });
  }



  onLoadData = treeNode =>
    new Promise(resolve => {
      if (treeNode.props.children) {
        resolve();
        return;
      }
      console.log('treeNode.props.dataRef : ', treeNode.props.dataRef)
      let param = {
        org_pid: treeNode.props.dataRef.org_id
      }

      HttpService.post('reportServer/org/listOrgTreeByOrgPid', JSON.stringify(param))
        .then(res => {
          if (res.resultCode == "1000") {
            treeNode.props.dataRef.children = res.data;
            this.setState({
              treeData: [...this.state.treeData],
            });
            resolve();
          }
          else {
            message.error(res.message);
          }

        });


    });


  onSelect = (selectedKeys, info) => {

    let param = {
      org_id: selectedKeys[0]
    }
    HttpService.post('reportServer/org/getOrgByID', JSON.stringify(param))
      .then(res => {
        if (res.resultCode == "1000") {
          this.props.form.setFieldsValue(res.data);
        }
        else {
          message.error(res.message);
        }
      });

    console.log('onSelect', info);
    console.log('selectedKeys', selectedKeys);
    this.setState({ selectedKeys });
  };
  // onSelect = (selectedKeys, info) => {
  //   console.log('onSelect', selectedKeys, info)
  //   // if (info.selected) {
  //   //   //点击节点
  //   //   this.props.form.setFieldsValue(info.node.props.dataRef);
  //   //   this.setState({
  //   //     action: 'edit',
  //   //     selectNode: info.node.props.dataRef
  //   //   })

  //   // }
  // }

  /**
   * 删除组织
   */
  onDeleteOrgClick = () => {
    if (this.state.selectNode) {
      let params = { org_id: this.state.selectNode.org_id }
      HttpService.post('reportServer/org/deleteByOrgId', JSON.stringify(params))
        .then(res => {
          if (res.resultCode == "1000") {
            // 删除完成需要刷新 
            message.success("删除成功");
          }
          else {
            message.error(res.message);
          }
        });
    } else {
      message.error('请选择需要删除的组织')
    }
  }

  /**
   * 添加组织
   */
  async onAddOrgClick() {

    let org_id = this.state.selectedKeys[0]
    //新境节点并，提交
    let aNode = { org_type: 1, org_num: '0000', org_name: '未命名', org_pid: org_id };
    await HttpService.post('reportServer/org/createOrg', JSON.stringify(aNode))
      .then(res => {
        if (res.resultCode == "1000") {
          message.success("创建成功");
          //返回ID,选中ID
          this.setState({ selectedKeys: [res.data] });
        }
        else {
          message.error(res.message);
        }
      });
    await this.getOrgTree();
    //  // selectedKeys=["35"];
    //  let s=this.state.selectedKeys;
    //   this.setState({selectedKeys:s});
    this.onSelect(this.state.selectedKeys, null);

    //选中当前节点
    // this.setState({ selectedKeys });


    // await this.loadOrgData('0');
    //加载当前节点的父
    // await this.loadOrgData('3');

    //

    // org_type,org_num,org_name,org_pid
    // let a= this.parseJson(this.state.treeData,3);
    // alert(stringify(a));
    //this.state.treeData.find()
    // if (this.state.selectNode) {

    //   this.props.form.setFieldsValue({ org_pid: this.state.selectNode.org_id });
    //   this.setState({
    //     action: 'create'
    //   })
    // } else {
    //   message.error('请选择上级组织')
    // }
  }
  parseJson = (jsonObj, id) => {
    // 循环所有键
    for (var v in jsonObj) {
      var element = jsonObj[v]
      // 1.判断是对象或者数组
      if (typeof (element) == 'object') {
        this.parseJson(element, id)
      } else {
        if (element == id) {
          console.log(v + ':' + id)
          return element;
        }
      }
    }
  }


  onExpand = expandedKeys => {
    console.log('onExpand', expandedKeys);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };


   onSaveOrgClick = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {

      if (!err) {

        let formInfo = this.props.form.getFieldsValue();

        HttpService.post('reportServer/org/updateOrgByOrgId', JSON.stringify(formInfo))
          .then(res => {
            if (res.resultCode == "1000") {
              //修改成功需要刷新列表
              message.success("保存成功");
              this.getOrgTree();

            }
            else {
              message.error(res.message);
            }
           
          });
         
      }
    });
  }



  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.name} key={item.id} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.id} title={item.name} isLeaf={item.isLeaf == 1} dataRef={item} />;
    });

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
        <Col xs={24} sm={6}>
          <Card title="组织架构">
            {/* <EditableTree/> */}
            <Tree style={{ height: '600px', overflow: 'auto' }}
              autoExpandParent={this.state.autoExpandParent}
              // loadData={this.onLoadData} 
              checkable
              onExpand={this.onExpand}
              expandedKeys={this.state.expandedKeys}
              // autoExpandParent={this.state.autoExpandParent}
              onCheck={this.onCheck}
              checkedKeys={this.state.checkedKeys}
              onSelect={this.onSelect}
              selectedKeys={this.state.selectedKeys}
            >


              >
              {this.renderTreeNodes(this.state.treeData)}
            </Tree>
          </Card>
        </Col>

        <Col xs={24} sm={18}>
          <Card title={<b> {this.state.action == 'create' ? '新增组织' : '编辑组织'} </b>} bordered={false} extra={<span>
            <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => this.onAddOrgClick()}>新增</Button>
            <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => this.onDeleteOrgClick()}>删除</Button>
            <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => this.onSaveOrgClick()}>保存</Button>
          </span>} bodyStyle={{ paddingBottom: '0px' }}>
            <Form >

              <FormItem style={{ display: 'none' }}>
                {getFieldDecorator('org_id')(
                  <Input type='text' />
                )}
              </FormItem>

              <FormItem style={{ display: 'none' }}>
                {getFieldDecorator('org_pid')(
                  <Input type='text' />
                )}
              </FormItem>

              <Row>
                <Col xs={24} sm={12}>
                  <FormItem {...formItemLayout} label="组织编号">
                    {getFieldDecorator('org_num', {
                      rules: [{ required: true, message: '请输入组织编号' }],
                    })(
                      <Input type='text' />
                    )}
                  </FormItem>
                </Col>
                <Col xs={24} sm={12}>
                  <FormItem {...formItemLayout} label="组织名称">
                    {getFieldDecorator('org_name', {
                      rules: [{ required: true, message: '请输入组织名称' }],
                    })(
                      <Input type='text' />
                    )}
                  </FormItem>
                </Col>
              </Row>

              <Row>
                <Col xs={24} sm={12}>
                  <FormItem {...formItemLayout} label="组织类别">
                    {getFieldDecorator('org_type', {
                      rules: [{ required: true, message: '请输入组织类别' }],
                    })(
                      <Input type='text' />
                    )}
                  </FormItem>
                </Col>
                <Col xs={24} sm={12}>
                  <FormItem {...formItemLayout} label="地址信息">
                    {getFieldDecorator('address', {
                      rules: [{ required: true, message: '请输入地址信息' }],
                    })(
                      <Input type='text' />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

      </div>
    )


  }


}
export default Form.create()(OrgManager);