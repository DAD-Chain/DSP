/* global window */
import React from 'react'
import NProgress from 'nprogress'
import PropTypes from 'prop-types'
import pathToRegexp from 'path-to-regexp'
import { connect } from 'dva'
import { Layout, Loader } from 'components'
import { classnames, config } from 'utils'
import { Helmet } from 'react-helmet'
import { withRouter } from 'dva/router'
import { LocaleProvider } from 'antd'
import { Modal, Button} from 'antd'
import enUS from 'antd/lib/locale-provider/en_US'
import '../themes/index.less'
import './app.less'
import Error from './error'

const { prefix, openPages,api } = config
const { walletDownloadAddr } = api
const { Header, Bread, Footer, Sider, styles } = Layout
let lastHref

const App = ({ children, dispatch, app, loading, location }) => {
    const { user, siderFold, darkTheme, isNavbar, menuPopoverVisible, navOpenKeys, menu, permissions } = app
    let { pathname } = location
    pathname = pathname.startsWith('/') ? pathname : `/${pathname}`
    const { iconFontJS, iconFontCSS, logo } = config

    const current = menu.filter(item => pathToRegexp(item.route || '').exec(pathname))
    let hasPermission = current.length ? permissions.visit.includes(current[0].id) : false
    const href = window.location.href
    if(pathname.indexOf("/slots") != -1 && permissions.visit.includes("10")){
        hasPermission = true
    }

    if (lastHref !== href) {
        NProgress.start()
        if (!loading.global) {
            NProgress.done()
            lastHref = href
        }
    }

    const headerProps = {
        menu,
        user,
        location,
        siderFold,
        isNavbar,
        menuPopoverVisible,
        navOpenKeys,
        switchMenuPopover () {
            dispatch({ type: 'app/switchMenuPopver' })
        },
        logout () {
            dispatch({ type: 'app/logout' })
        },
        switchSider () {
            dispatch({ type: 'app/switchSider' })
        },
        changeOpenKeys (openKeys) {
            dispatch({ type: 'app/handleNavOpenKeys', payload: { navOpenKeys: openKeys } })
        },
    }

    const siderProps = {
        menu,
        location,
        siderFold,
        darkTheme,
        navOpenKeys,
        changeTheme () {
            dispatch({ type: 'app/switchTheme' })
        },
        changeOpenKeys (openKeys) {
            window.localStorage.setItem(`${prefix}navOpenKeys`, JSON.stringify(openKeys))
            dispatch({ type: 'app/handleNavOpenKeys', payload: { navOpenKeys: openKeys } })
        },
    }

    const breadProps = {
        menu,
        location,
    }

    if (openPages && openPages.includes(pathname)) {
        return (<div>
            <Loader fullScreen spinning={loading.effects['app/query']} />
            {children}
        </div>)
    }

    function handleDownloadCancel(){
        dispatch({
            type: 'app/closeDownloadModel',
        })
    }

    function handleModelOk(){
        dispatch({
            type: 'app/closeWarningModel',
        })
    }

    function handleDownloadOk(){
        window.open('http://'+walletDownloadAddr, '_blank');
        dispatch({
            type: 'app/closeDownloadModel',
        })
    }

    const getFooter = () => {
        return(
            <div>
                <Button type="ghost" size="large" onClick={handleDownloadCancel}>Cancel</Button>
                <Button type="primary" size="large" onClick={handleDownloadOk}>Download</Button>
            </div>
        )
    }

    const getWarningFooter = () => {
        return(
            <div>
                <Button type="primary" size="large" onClick={handleModelOk}>OK</Button>
            </div>
        )
    }
    if(!hasPermission){
        dispatch({
            type: 'app/redirectToLogin',
        })

    }
    return (
        <LocaleProvider locale={enUS}>
            <div>
                {/*<Loader fullScreen spinning={loading.effects['application/create']} />*/}
                <Loader fullScreen spinning={app.showLoading} />
                {/* <Loader fullScreen spinning={loading.effects['application/changeStatus']} />
                <Loader fullScreen spinning={loading.effects['campaign/create']} />
                <Loader fullScreen spinning={loading.effects['campaign/makeNoPending']} />
                <Loader fullScreen spinning={loading.effects['campaign/changeStatus'  ]} /> */}
                <Helmet>
                    <title>DAD DSP</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <link rel="icon" href={logo} type="image/x-icon" />
                    {iconFontJS && <script src={iconFontJS} />}
                    {iconFontCSS && <link rel="stylesheet" href={iconFontCSS} />}
                </Helmet>
                <div
                    className={classnames(styles.layout, { [styles.fold]: isNavbar ? false : siderFold }, { [styles.withnavbar]: isNavbar })}
                >
                    {!isNavbar ? <aside className={classnames(styles.sider, { [styles.light]: !darkTheme })}>
                        {siderProps.menu.length === 0 ? null : <Sider {...siderProps} />}
                    </aside> : ''}
                    <div className={styles.main}>
                        <Header {...headerProps} />
                        <Bread {...breadProps} />
                        <div className={styles.container}>
                            <div className={styles.content}>
                                {hasPermission ? children : <Error />}
                            </div>
                        </div>
                        { /* <Footer /> */ }
                    </div>
                </div>
                <Modal
                title="Tips"
                zIndex={99999999999}
                closable={false}
                visible={app.showDonwloadModel}
                footer = {getFooter()}
                >
                    <p>Please install DAD wallet extension, and log in with DAD wallet, after that please do this operation again.</p>
                </Modal>
                <Modal
                title="Tips"
                zIndex={99999999999}
                closable={false}
                visible={app.showWarningModel}
                footer = {getWarningFooter()}
                >
                    <p>{app.warningModelText}</p>
                </Modal>
            </div>
        </LocaleProvider>
    )
}

App.propTypes = {
    children: PropTypes.element.isRequired,
    location: PropTypes.object,
    dispatch: PropTypes.func,
    app: PropTypes.object,
    loading: PropTypes.object
}

export default withRouter(connect(({ app, loading }) => ({ app, loading }))(App))
