import React from 'react';
import { HashRouter as Router, Switch, Redirect, Route, Link } from 'react-router-dom';
import Loadable from 'react-loadable';
import loading from '../../util/loading.jsx';
// 页面
// import assetList from './assetList.jsx';
// import assetEdit from './assetEdit.jsx';
// import gatewayList from './gatewayList.jsx';
// import gatewayEdit from './gatewayEdit.jsx';
// import assetmapGaoDe from './assetmapGaoDe.jsx';
// import gatewayManagementOld from './gatewayManagementOld.jsx';

// import dashboard from './dashboard.jsx'
// import assetAlarmList from './assetAlarmList.jsx';
// import gatewayMonitor from './gatewayMonitor.jsx';
// import assetInventory from './assetInventory.jsx';
// import assetCube from './assetCube.jsx';


const assetAlarmList = Loadable({
    loader: () => import(/* webpackChunkName: "assetCube" */ './assetAlarmList.jsx'),
    loading: loading,
    delay: 3000
});

const gatewayMonitor = Loadable({
    loader: () => import(/* webpackChunkName: "assetmapGaoDe" */ './gatewayMonitor.jsx'),
    loading: loading,
    delay: 3000
});


const assetCube = Loadable({
    loader: () => import(/* webpackChunkName: "assetCube" */ './assetCube.jsx'),
    loading: loading,
    delay: 3000
});

const assetmapGaoDe = Loadable({
    loader: () => import(/* webpackChunkName: "assetmapGaoDe" */ './assetmapGaoDe.jsx'),
    loading: loading,
    delay: 3000
});



const assetList = Loadable({
    loader: () => import('./assetList.jsx'),
    loading: loading,
    delay: 3000
});

const assetEdit = Loadable({
    loader: () => import('./assetEdit.jsx'),
    loading: loading,
    delay: 3000
});

const gatewayManagementOld = Loadable({
    loader: () => import(/* webpackChunkName: "gatewayManagementOld" */ './gatewayManagementOld.jsx'),
    loading: loading,
    delay: 3000
});
const assetInventory = Loadable({
    loader: () => import(/* webpackChunkName: "assetInventory" */ './assetInventory.jsx'),
    loading: loading,
    delay: 3000
});

const gatewayList = Loadable({
    loader: () => import(/* webpackChunkName: "assetMonitoring" */ './gatewayList.jsx'),
    loading: loading,
    delay: 3000
});

const dashboard = Loadable({
    loader: () => import(/* webpackChunkName: "gatewayManagement" */ './dashboard.jsx'),
    loading: loading,
    delay: 3000
});

const gatewayEdit = Loadable({
    loader: () => import(/* webpackChunkName: "addGateway" */ './gatewayEdit.jsx'),
    loading: loading,
    delay: 3000
});



export default class assetRouter extends React.Component {
    render() {
        return (
            <Switch>
                <Route path="/asset/assetList" component={assetList} />
                <Route path="/asset/assetEdit/:action/:id" component={assetEdit} />
                <Route path="/asset/gatewayList" component={gatewayList} />
                <Route path="/asset/gatewayEdit/:action/:id" component={gatewayEdit} />
                <Route path="/asset/assetmapGaoDe/:lng/:lat" component={assetmapGaoDe} />
                <Route path="/asset/assetmapGaoDe" component={assetmapGaoDe} />
                <Route path="/asset/gatewayManagementOld" component={gatewayManagementOld} />
                <Route path="/asset/dashboard" component={dashboard} />
                <Route path="/asset/assetAlarmList" component={assetAlarmList} />
                <Route path="/asset/gatewayMonitor" component={gatewayMonitor} />
                <Route path="/asset/assetInventory" component={assetInventory} />

              <Route path="/asset/assetCube" component={assetCube} />
                
           
                  {/* <Route path="/assetMonitoring" component={assetMonitoring} />
                <Route path="/gatewayManagement" component={gatewayManagement} />
                <Route path="/addGateway/:name" component={addGateway} />
                <Route path="/assetmapGaoDe" component={assetmapGaoDe} />
                <Redirect exact from="/asset" to="/asset/assetList" /> */}
            </Switch>
        )
    }
}