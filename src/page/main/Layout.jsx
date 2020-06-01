import React from 'react';
// import  Layout  from 'antd/lib/layout';
// import 'antd/lib/layout/style/css';        // 加载 CSS
import Loadable from 'react-loadable';
import loading from '../../util/loading.jsx'
import './Layout.scss';
const SiderBar = Loadable({
    loader: () => import(/* webpackChunkName: "Sidebar" */ './Sidebar.jsx'),
    loading: loading,
    delay:3000
});
const TopBar = Loadable({
    loader: () => import(/* webpackChunkName: "Topbar" */ './Topbar.jsx'),
    loading: loading,
    delay:3000
});

export default class MainLoyout extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            collapsed: false,
            windthleft:'250px',
        };
    }
    
    onChildChanged=(newState)=>{
        this.setState({
            collapsed: newState,
            windthleft:newState==true?'60px':'250px'
        });
    }
    render() {
        
        return (
            <div id="wrapper">
                <TopBar callbackParent={this.onChildChanged}/>
                <SiderBar collapsed={this.state.collapsed}/>
                
                <div id="page-wrapperNew" style={{marginLeft:this.state.windthleft}}>
                     {this.props.children}
                </div>
            </div>
          
        );
    }
}

