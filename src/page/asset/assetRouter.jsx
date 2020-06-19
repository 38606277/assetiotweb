import React from 'react';
import { HashRouter as Router, Switch, Redirect, Route, Link } from 'react-router-dom'
// 页面
 import assetList from './assetList.jsx';
 import assetEdit from './assetEdit.jsx';
 import gatewayList from './gatewayList.jsx';
 import gatewayEdit from './gatewayEdit.jsx';
 import assetmapGaoDe from './assetmapGaoDe.jsx'; 
 import gatewayManagementOld from './gatewayManagementOld.jsx';
 import Analysis from '../../page/dashboard/analysis.jsx';
 import  dashboard    from './dashboard.jsx'



// const assetmap = Loadable({
//     loader: () => import(/* webpackChunkName: "assetmap" */ './assetmap.jsx'),
//     loading: loading,
//     delay: 3000
// });

// const assetmapGaoDe = Loadable({
//     loader: () => import(/* webpackChunkName: "assetmap" */ './assetmapGaoDe.jsx'),
//     loading: loading,
//     delay: 3000
// });



// const assetList = Loadable({
//     loader: () => import(/* webpackChunkName: "assetList" */ './assetList.jsx'),
//     loading: loading,
//     delay: 3000
// });

// const assetEdit = Loadable({
//     loader: () => import(/* webpackChunkName: "assetEdit" */ './assetEdit.jsx'),
//     loading: loading,
//     delay: 3000
// });

// const gatewayManagementOld = Loadable({
//     loader: () => import(/* webpackChunkName: "gatewayManagementOld" */ './gatewayManagementOld.jsx'),
//     loading: loading,
//     delay: 3000
// });
// const assetInventory = Loadable({
//     loader: () => import(/* webpackChunkName: "assetInventory" */ './assetInventory.jsx'),
//     loading: loading,
//     delay: 3000
// });

// const assetMonitoring = Loadable({
//     loader: () => import(/* webpackChunkName: "assetMonitoring" */ './assetMonitoring.jsx'),
//     loading: loading,
//     delay: 3000
// });

// const gatewayManagement = Loadable({
//     loader: () => import(/* webpackChunkName: "gatewayManagement" */ './gatewayManagement.jsx'),
//     loading: loading,
//     delay: 3000
// });

// const addGateway = Loadable({
//     loader: () => import(/* webpackChunkName: "addGateway" */ './addGateway.jsx'),
//     loading: loading,
//     delay: 3000
// });



export default class assetRouter extends React.Component {
    render() {
        return (
            <Switch>
                <Route path="/asset/assetList" component={assetList} />
                <Route path="/asset/assetEdit/:action/:id" component={assetEdit} />
                <Route path="/asset/gatewayList" component={gatewayList} />
                <Route path="/asset/gatewayEdit/:action/:id" component={gatewayEdit} />
                <Route path="/asset/assetmapGaoDe" component={assetmapGaoDe} />
                <Route path="/asset/gatewayManagementOld" component={gatewayManagementOld} />
                <Route path="/asset/dashboard" component={dashboard} />
                {/* <Route path="/asset/assetmap" component={assetmap} />
                
                <Route path="/assetInventory" component={assetInventory} />
                <Route path="/assetMonitoring" component={assetMonitoring} />
                <Route path="/gatewayManagement" component={gatewayManagement} />
                <Route path="/addGateway/:name" component={addGateway} />
                <Route path="/assetmapGaoDe" component={assetmapGaoDe} />
                <Redirect exact from="/asset" to="/asset/assetList" /> */}
            </Switch>
        )
    }
}