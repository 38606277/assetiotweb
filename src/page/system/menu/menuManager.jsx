import React from 'react';
import { Card, Row, Col, Icon, Skeleton, Avatar, Input, Button, Table, Tabs, message } from 'antd';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend'
import update from 'immutability-helper';
import HttpService from '../../../util/HttpService.jsx';
const { TabPane } = Tabs;
let dragingIndex = -1;



class TabNode extends React.Component {
  render() {
    const { connectDragSource, connectDropTarget, children } = this.props;

    return connectDragSource(connectDropTarget(children));
  }
}

const cardTarget = {
  drop(props, monitor) {
    const dragKey = monitor.getItem().index;
    const hoverKey = props.index;

    if (dragKey === hoverKey) {
      return;
    }

    props.moveTabNode(dragKey, hoverKey);
    monitor.getItem().index = hoverKey;
  },
};

const cardSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
    };
  },
};

const WrapTabNode = DropTarget('DND_NODE', cardTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(
  DragSource('DND_NODE', cardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }))(TabNode),
);

/**
 * 拖拽标签栏 Drag & Drop node 
 */
class DraggableTabs extends React.Component {

  constructor(props) {
    super(props);
    this.state = { ...props }

    console.log('DraggableTabs', this.state)
  }

  componentWillReceiveProps(nextProps) {
    this.state = { ...nextProps }
  }

  moveTabNode = (dragKey, hoverKey) => {
    const newOrder = this.state.order.slice();
    const { children } = this.props;

    React.Children.forEach(children, c => {
      if (newOrder.indexOf(c.key) === -1) {
        newOrder.push(c.key);
      }
    });

    const dragIndex = newOrder.indexOf(dragKey);
    const hoverIndex = newOrder.indexOf(hoverKey);

    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, dragKey);

    this.setState({
      order: newOrder,
    });
    //console.log(dragIndex, hoverIndex, dragKey)

    this.state.onTabsDataChanage(dragIndex, hoverIndex)
  };

  renderTabBar = (props, DefaultTabBar) => (
    <DefaultTabBar {...props}>
      {node => (
        <WrapTabNode key={node.key} index={node.key} moveTabNode={this.moveTabNode}>
          {node}
        </WrapTabNode>
      )}
    </DefaultTabBar>
  );

  render() {
    const { order } = this.state;
    const { children } = this.props;

    const tabs = [];
    React.Children.forEach(children, c => {
      tabs.push(c);
    });

    const orderTabs = tabs.slice().sort((a, b) => {
      const orderA = order.indexOf(a.key);
      const orderB = order.indexOf(b.key);

      if (orderA !== -1 && orderB !== -1) {
        return orderA - orderB;
      }
      if (orderA !== -1) {
        return -1;
      }
      if (orderB !== -1) {
        return 1;
      }

      const ia = tabs.indexOf(a);
      const ib = tabs.indexOf(b);

      return ia - ib;
    });

    return (
      <DndProvider backend={HTML5Backend}>
        <Tabs renderTabBar={this.renderTabBar} {...this.props}>
          {orderTabs}
        </Tabs>
      </DndProvider>
    );
  }
}


class BodyRow extends React.Component {
  render() {
    const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let { className } = restProps;
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(<tr {...restProps} className={className} style={style} />),
    );
  }
}

const rowSource = {
  beginDrag(props) {
    dragingIndex = props.index;
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    console.log('rowTarget', props, monitor);

    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
}))(
  DragSource('row', rowSource, connect => ({
    connectDragSource: connect.dragSource(),
  }))(BodyRow),
);





/**
 * 拖拽表格
 */
class DragSortingTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = { ...props }
    console.log('DragSortingTable', this.state)
  }

  components = {
    body: {
      row: DragableBodyRow,
    },
  };

  moveRow = (dragIndex, hoverIndex) => {
    const { dataList } = this.state;
    const dragRow = dataList[dragIndex];

    this.setState(
      update(this.state, {
        dataList: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
        },
      }),
    )

    this.state.onTableDataChanage(this.state.func_pid, this.state.dataList);

    console.log('当前列表', this.state.dataList)
  }

  render() {

    return (
      <DndProvider backend={HTML5Backend}>
        <Table
          columns={this.state.columns}
          dataSource={this.state.dataList}
          components={this.components}
          onRow={(record, index) => ({
            index,
            moveRow: this.moveRow,
          })}
          expandIcon={() => { return (<span />) }}
        />
      </DndProvider>
    );
  }
}


/**
 * 菜单管理
 */
export default class MenuManager extends React.Component {

  state = {
    dataTreeList: [
    ],
    columns: [
      {
        title: '序号',
        dataIndex: 'order',
        key: 'order'
      },
      {
        title: '名称',
        dataIndex: 'func_name',
        key: 'func_name',
      },
      {
        title: '路径',
        dataIndex: 'func_url',
        key: 'func_url',
      },
      {
        title: '类别',
        dataIndex: 'func_type',
        key: 'func_type',
      }
    ]
  };

  //初始化加载调用方法
  componentDidMount() {
    this.loadData();
  }

  loadData() {
    HttpService.post("reportServer/menu/getMenuTreeList", JSON.stringify({ asset_id: this.state.id }))
      .then(res => {
        if (res.resultCode == "1000") {
          this.setState({
            dataTreeList: res.data
          })
        }
        else
          message.error(res.message);

      });
  }

  onAddMenuClick = () => {

  }

  onDeleteMenuClick = () => {

  }

  onSaveMenuClick = () => {
    HttpService.post('reportServer/menu//updateMenuTreeListOrder', JSON.stringify({ menuTreeList: this.state.dataTreeList }))
      .then(res => {
        if (res.resultCode == "1000") {
          message.success(res.message);
          this.loadData()
        }
        else {
          message.error(res.message);
        }

      });

    console.log("dataTreeList",)
  }

  //列表排序后回调
  onTableDataChanage(func_pid, dataList) {
    let { dataTreeList } = this.state;
    //循环找到菜单 
    for (let i in dataTreeList) {
      let menuItem = dataTreeList[i];
      if (menuItem.func_id == func_pid) {
        menuItem.children = dataList;
        break;
      }
    }

  }
  onTabsDataChanage(oldIndex, newIndex) {
    let { dataTreeList } = this.state;
    let data = dataTreeList.splice(oldIndex, 1);
    console.log("data", data)
    dataTreeList.splice(newIndex, 0, data[0]);
    this.state.dataTreeList = dataTreeList;
    console.log("onTabsDataChanage", this.state.dataTreeList)
  }


  // TabPaneList(props) {
  //   let { dataTreeList, columns } = props;
  //   let items = [];
  //   for (let i = 0; i < dataTreeList.length; i++) {
  //     let item = dataTreeList[i];
  //     console.log('item', item)
  //     items.push(<TabPane tab={item.func_name} key={i}>
  //       <DragSortingTable
  //         columns={columns}
  //         dataList={item.children}
  //         func_pid={item.func_id}
  //         onTableDataChanage={(func_pid, dataList) => { this.onTableDataChanage(func_pid, dataList) }}
  //       />
  //     </TabPane>);
  //   }

  //   return ({ items });
  // }


  render() {
    let { dataTreeList } = this.state;
    let items = [];
    console.log('dataTreeList', dataTreeList)
    for (let i = 0; i < dataTreeList.length; i++) {
      let item = dataTreeList[i];

      items.push(<TabPane tab={item.func_name} key={i}>
        <DragSortingTable
          columns={this.state.columns}
          dataList={item.children}
          func_pid={item.func_id}
          onTableDataChanage={(func_pid, dataList) => { this.onTableDataChanage(func_pid, dataList) }}
        />
      </TabPane>);
    }
    console.log('重新执行了 render', items)
    return (

      <div id="page-wrapper">
        <Card title="组织架构">
          {/* <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => this.onAddMenuClick()}>新增</Button>
          <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => this.onDeleteMenuClick()}>删除</Button> */}
          <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => this.onSaveMenuClick()}>保存</Button>
          <DraggableTabs
            onTabsDataChanage={(oldIndex, newIndex) => { this.onTabsDataChanage(oldIndex, newIndex) }}
            order={[]}
          >
            {items}
          </DraggableTabs>
        </Card>
      </div>

    );
  }
}