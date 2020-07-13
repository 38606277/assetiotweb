import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Switch, Redirect, Route } from 'react-router-dom'

import Loadable from 'react-loadable';
import loading from './util/loading.jsx'
import 'antd/dist/antd.less';
import './App.css'
import LocalStorge from './util/LogcalStorge.jsx';
const localStorge = new LocalStorge();



const Layout = Loadable({
    loader: () => import(/* webpackChunkName: "Layout" */ './page/main/Layout.jsx'),
    loading: loading,
    delay: 3000
});



const UserRouter = Loadable({
    loader: () => import(/* webpackChunkName: "UserRouter" */ './page/user/router.jsx'),
    loading: loading,
    delay: 3000
});

const DbsRouter = Loadable({
    loader: () => import(/* webpackChunkName: "DbsRouter" */ './page/system/dbs/dbsrouter.jsx'),
    loading: loading,
    delay: 3000
});
const RuleRouter = Loadable({
    loader: () => import(/* webpackChunkName: "RuleRouter" */ './page/system/rule/rulerouter.jsx'),
    loading: loading,
    delay: 3000
});

const RoleRouter = Loadable({
    loader: () => import(/* webpackChunkName: "RoleRouter" */ './page/system/role/rolerouter.jsx'),
    loading: loading,
    delay: 3000
});

const Login = Loadable({
    loader: () => import(/* webpackChunkName: "login" */ './page/login/index.jsx'),
    loading: loading,
    delay: 3000
});

const Home = Loadable({
    loader: () => import(/* webpackChunkName: "Home" */ './page/home/index.jsx'),
    loading: loading,
    delay: 3000
});



const Auth = Loadable({
    loader: () => import( /* webpackChunkName: "Auth" */ './page/system/auth/auth.jsx'),
    loading: loading,
    delay: 3000
});
const AuthTypeRouter = Loadable({
    loader: () => import(/* webpackChunkName: "AuthTypeRouter" */ './page/system/authType/authTypeRouter.jsx'),
    loading: loading,
    delay: 3000
});




const assetRouter = Loadable({
    loader: () => import(/* webpackChunkName: "assetRouter" */ './page/asset/assetRouter.jsx'),
    loading: loading,
    delay: 3000
});


const OrgManagerRouter = Loadable({
    loader: () => import(/* webpackChunkName: "OrgManagerRouter" */ './page/system/org/OrgManagerRouter.jsx'),
    loading: loading,
    delay: 3000
});

const MenuManagerRouter = Loadable({
    loader: () => import(/* webpackChunkName: "MenuManagerRouter" */ './page/system/menu/MenuManagerRouter.jsx'),
    loading: loading,
    delay: 3000
});



const LayoutRouter = (nextState, replace) => {
    if (undefined != localStorge.getStorage('userInfo') && '' != localStorge.getStorage('userInfo')) {
        return (
            <Layout>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route path="/user" component={UserRouter} />
                    <Route path="/dbs" component={DbsRouter} />
                    <Route path="/rule" component={RuleRouter} />
                    <Route path="/Auth" component={Auth} />
                    <Route path="/role" component={RoleRouter} />
                    <Route path="/authType" component={AuthTypeRouter} />
                    <Route path="/asset" component={assetRouter} />
                    <Route path="/org" component={OrgManagerRouter} />
                    <Route path="/menu" component={MenuManagerRouter} />
                </Switch>
            </Layout>
        );
    } else {
        localStorage.setItem('lasurl', nextState.location.pathname);
        return (<Redirect to="/login" />);
    }
}

class App extends React.Component {
    render() {

        return (
            <Router>
                <Switch>
                    <Route path="/login" component={Login} />
                    <Route path="/" render={LayoutRouter} />
                </Switch>
            </Router>
        )
    }
}
ReactDOM.render(
    <App />,
    document.getElementById('app')
);
