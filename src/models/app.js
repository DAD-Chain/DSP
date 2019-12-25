/* global window */
/* global document */
/* global location */
import { routerRedux } from 'dva/router'
import { parse } from 'qs'
import config from 'config'
import { EnumRoleType } from 'enums'
import { query, logout, getDefaultEntrance } from 'services/app'
import { isWalletAvaliable, getAccount} from 'services/dapi'
import * as menusService from 'services/menus'
import queryString from 'query-string'
import eventEmitter from '../utils/eventEmitter'

const { prefix } = config

const initialState = {
    isAdmin: false,
    user: {},
    permissions: {
        visit: [],
    },
    menu: [
        // {
        //     id: 1,
        //     icon: 'laptop',
        //     name: 'Dashboard',
        //     router: '/dashboard',
        // },
    ],
    breadcrumb: [],
    menuPopoverVisible: false,
    siderFold: window.localStorage.getItem(`${prefix}siderFold`) === 'true',
    darkTheme: window.localStorage.getItem(`${prefix}darkTheme`) === 'true',
    isNavbar: document.body.clientWidth < 769,
    navOpenKeys: JSON.parse(window.localStorage.getItem(`${prefix}navOpenKeys`)) || [],
    locationPathname: '',
    showDonwloadModel: false,
    showWarningModel:false,
    warningModelText:'',
    showLoading: false,
    locationQuery: {},
}

export default {
    namespace: 'app',
    state: initialState,
    subscriptions: {

        setupHistory ({ dispatch, history }) {
            history.listen((location) => {
                dispatch({
                    type: 'updateState',
                    payload: {
                        locationPathname: location.pathname,
                        locationQuery: queryString.parse(location.search),
                    },
                })
            })
        },

        setup ({ dispatch }) {

            dispatch({ type: 'query' })
            let tid
            window.onresize = () => {
                clearTimeout(tid)
                tid = setTimeout(() => {
                    dispatch({ type: 'changeNavbar' })
                }, 300)
            }

            var maxTime = 60*60; // seconds
            var interval
            var count = 0;
            if(!window.time){
                window.time = maxTime;
            }

            document.body.addEventListener("mousemove", function() {
                window.time = maxTime; // reset
            }, false);

            var intervalId = setInterval(function() {
                window.time--;
                if(window.time <= 0) {
                    ShowInvalidLoginMessage();
                    clearInterval(intervalId);
                }
            }, 1000)

            function ShowInvalidLoginMessage() {
                count++;
                window.count++;
                clearInterval(interval);
                dispatch({ type: 'checkWalletStatus' })
            }
        },

    },
    effects: {

        * redirectToLogin ({ payload = {} }, { put, select }) {
            const { locationPathname } = yield select(_ => _.app)
            sessionStorage.removeItem('loginState');
            yield put(routerRedux.push({
                pathname: '/login',
                search: queryString.stringify({
                    from: payload.from || locationPathname,
                }),
            }))
        },

        * query ({ payload }, { call, put, select }) {



            let sessionData = sessionStorage.getItem('loginState');



            if(sessionData && payload){
                const { success, user } = payload


                const { locationPathname } = yield select(_ => _.app)

                if (success && user) {
                    yield put({type:'reset'})
                    sessionStorage.setItem('loginState', JSON.stringify(payload));
                    //const { permissions } = user
                    const permissions = {}
                    // const list = yield call(menusService.query, { role: user })
                    const list = getMenu(user)
                    let menu = list
                    // The roles who can visit all menus in list
                    // if (permissions.role === EnumRoleType.ADMIN
                    //     || permissions.role === EnumRoleType.SENIOR_MANAGER
                    //     || permissions.role === EnumRoleType.DEVELOPER) {

                    permissions.visit = list.map(item => item.id)
                    // } else {
                    //     // Filter the menus based on permissions.visit
                    //     menu = list.filter((item) => {
                    //         const cases = [
                    //             permissions.visit.includes(item.id),
                    //             item.mpid ? permissions.visit.includes(item.mpid) || item.mpid === '-1' : true,
                    //             item.bpid ? permissions.visit.includes(item.bpid) : true,
                    //         ]
                    //         return cases.every(_ => _)
                    //     })
                    // }
                    yield put({
                        type: 'updateState',
                        payload: {
                            user,
                            permissions,
                            menu,
                            isAdmin: permissions.role === EnumRoleType.ADMIN,
                        },
                    })

                    // Specify different entrance for different roles
                    let defaultEntrance = getDefaultEntrance(user)

                    if (location.pathname === '/login') {
                        yield put(routerRedux.push({
                            pathname: defaultEntrance,
                        }))
                    } else if (location.pathname === '/') {
                        yield put(routerRedux.push({
                            pathname: defaultEntrance,
                        }))
                    } else{
                        yield put(routerRedux.replace({
                            pathname: defaultEntrance,
                        }))
                    }
                } else if (config.openPages && config.openPages.indexOf(locationPathname) < 0) {
                    yield put({ type: 'redirectToLogin' })
                }
            }else{
                if(sessionData){
                    sessionData = JSON.parse(sessionData)
                    const { user } = sessionData
                    const permissions = {}
                    // const list = yield call(menusService.query, { role: user })
                    const list = getMenu(user)
                    let menu = list

                    permissions.visit = list.map(item => item.id)

                    yield put({
                        type: 'updateState',
                        payload: {
                            user,
                            permissions,
                            menu,
                            isAdmin: permissions.role === EnumRoleType.ADMIN,
                        },
                    })

                    let defaultEntrance = getDefaultEntrance(user);
                    if (location.pathname === '/login') {
                        yield put(routerRedux.push({
                            pathname: defaultEntrance,
                        }))
                    } else {
                        // yield put(routerRedux.push({
                        //     pathname: location.pathname,
                        // }))
                    }
                }else{

                    if(payload){
                        const { success, user } = payload


                        const { locationPathname } = yield select(_ => _.app)

                        if (success && user) {
                            sessionStorage.setItem('loginState', JSON.stringify(payload));
                            //const { permissions } = user
                            const permissions = {}
                            // const list = yield call(menusService.query, { role: user })
                            const list = getMenu(user)
                            let menu = list

                            permissions.visit = list.map(item => item.id)


                            yield put({
                                type: 'updateState',
                                payload: {
                                    user,
                                    permissions,
                                    menu,
                                    isAdmin: permissions.role === EnumRoleType.ADMIN,
                                },
                            })

                            // Specify different entrance for different roles
                            let defaultEntrance = getDefaultEntrance(user)
                            if (location.pathname === '/login') {
                                yield put(routerRedux.push({
                                    pathname: defaultEntrance,
                                }))
                            } else if (location.pathname === '/') {
                                yield put(routerRedux.push({
                                    pathname: defaultEntrance,
                                }))
                            }
                        } else if (config.openPages && config.openPages.indexOf(locationPathname) < 0) {
                            yield put({ type: 'redirectToLogin' })
                        }
                    }else{
                        yield put({ type: 'redirectToLogin' })
                    }
                }
            }




        },

        * logout ({ payload }, { call, put }) {
            const data = yield call(logout, parse(payload))
            if (data.success) {
                eventEmitter.emit('logout')
                sessionStorage.removeItem('loginState');
                yield put({type:'reset'})
                yield put({ type: 'redirectToLogin', payload: { from: '/' } })

            } else {
                throw (data)
            }
        },

        * changeNavbar (action, { put, select }) {
            const { app } = yield (select(_ => _))
            const isNavbar = document.body.clientWidth < 769
            if (isNavbar !== app.isNavbar) {
                yield put({ type: 'handleNavbar', payload: isNavbar })
            }
        },

        * openDownloadModel({}, { call, put, select }){
            yield put({ type: 'switchDonwloadModel', payload: true })
        },

        * closeDownloadModel({}, { call, put, select }){
            yield put({ type: 'switchDonwloadModel', payload: false })
        },

        * openWarningModel({payload}, { call, put, select }){
            yield put({ type: 'switchWarningModel', payload: {showWarningModel:true,warningModelText:payload.text} })
        },
        * closeWarningModel({}, { call, put, select }){
            yield put({ type: 'switchWarningModel', payload: false })
        },

        * openLoading({}, { call, put, select }){
            yield put({ type: 'switchLoading', payload: true })
        },

        * closeLoading({}, { call, put, select }){
            yield put({ type: 'switchLoading', payload: false })
        },

        * checkWallet({}, { call, put, select }){
            const walletInfo = yield call(isWalletAvaliable)
        },

        * checkWalletStatus({}, {call, put, select}){
            const walletInfo = yield call(isWalletAvaliable)
            if(!walletInfo){//钱包未安装或者禁用
                yield put({type:'redirectToLogin'});
            }
            const sessionData = JSON.parse(sessionStorage.getItem('loginState'));
            const accountInfo = yield call(getAccount);
            if(accountInfo.code !== 0){//未登录钱包
                yield put({type:'redirectToLogin'});
            }

            if(accountInfo.result.value != sessionData.result.wallet_address){//当前钱包账户与登录不一致
                yield put({type:'redirectToLogin'});
            }
        }
    },
    reducers: {
        updateState (state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        },

        reset (state) {
            return {
                ...state,
                ...initialState,
            }
        },

        switchSider (state) {
            window.localStorage.setItem(`${prefix}siderFold`, !state.siderFold)
            return {
                ...state,
                siderFold: !state.siderFold,
            }
        },

        switchTheme (state) {
            window.localStorage.setItem(`${prefix}darkTheme`, !state.darkTheme)
            return {
                ...state,
                darkTheme: !state.darkTheme,
            }
        },

        switchMenuPopver (state) {
            return {
                ...state,
                menuPopoverVisible: !state.menuPopoverVisible,
            }
        },

        handleNavbar (state, { payload }) {
            return {
                ...state,
                isNavbar: payload,
            }
        },

        switchDonwloadModel (state, { payload }){
            return {
                ...state,
                showDonwloadModel: payload,
            }
        },

        switchWarningModel (state, { payload }){
            return {
                ...state,
                showWarningModel: payload.showWarningModel,
                warningModelText:payload.warningModelText
            }
        },

        switchLoading (state, { payload }){
            return {
                ...state,
                showLoading: payload,
            }
        },

        handleNavOpenKeys (state, { payload: navOpenKeys }) {
            return {
                ...state,
                ...navOpenKeys,
            }
        },
    },
}

function getMenu(role){
    const visitPage = {
        Application: {
            id: '10',
            icon: 'schedule',
            name: 'Application',
            route: '/application',
        },
        Campaign: {
            id: '8',
            icon: 'shopping-cart',
            name: 'Campaign',
            route: '/campaign',
        },
        CampaignReport: {
            id: '9',
            icon: 'laptop',
            name: 'Campaign Report',
            route: '/campaign-report',
        },
        SlotReport: {
            id: '11',
            icon: 'hdd',
            name: 'Slot Report',
            route: '/slot-report',
        },
        DashBoard: {
            id: '12',
            icon: 'area-chart',
            name: 'DashBoard',
            route: '/dashboard',
        },
        Slots: {
            bpid: "10",
            id: "101",
            mpid: "-1",
            name: "Slots",
            route: "/application/:id/slots",
        }

    }
    let res = []

    if (role === 'PUBLISHER') {
        res.push(visitPage.Application)
        res.push(visitPage.SlotReport)
        res.push(visitPage.Slots)
    } else if (role === 'ADVERTISER') {
        res.push(visitPage.DashBoard)
        res.push(visitPage.Campaign)
        res.push(visitPage.CampaignReport)
    }

    return res
}
