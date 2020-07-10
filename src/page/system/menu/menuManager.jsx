import React from 'react';
import { Card, Row, Col, Icon, Skeleton, Avatar, Input, Button, Table, Tabs } from 'antd';
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
  state = {
    order: [],
  };

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
    );
  };

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
        dataIndex: 'number',
        key: 'number',
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


  render() {
    let { dataTreeList } = this.state;
    let items = [];
    console.log('dataTreeList', dataTreeList)
    for (let i = 0; i < dataTreeList.length; i++) {
      let item = dataTreeList[i];
      console.log('item', item)
      items.push(<TabPane tab={item.func_name} key={i}>
        <DragSortingTable
          columns={this.state.columns}
          dataList={item.children}
        />
      </TabPane>);
    }
    console.log('items', items)
    return (


      <DraggableTabs>

        {items}

      </DraggableTabs>

    );
  }
}