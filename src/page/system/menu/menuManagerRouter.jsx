
import React from 'react';
import { HashRouter as Router, Switch, Redirect, Route, Link } from 'react-router-dom'
// 页面
import MenuManager from './menuManager.jsx';

class OrgManagerRouter extends React.Component {
    render() {
        return (
            <Switch>
                <Route path="/menu/menuManager" component={MenuManager} />
                <Redirect exact from="/menu" to="/menu/menuManager" />
            </Switch>
        )
    }
}
export default OrgManagerRouter;