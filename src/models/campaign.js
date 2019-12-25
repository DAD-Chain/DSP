/**
 * campaign.js
 *
 * @author hyczzhu
 */

import modelExtend from 'dva-model-extend'
import moment from 'moment'
import { message } from 'antd'
import { queryList as queryCampaignList, query, create, remove, update, duplicate,deleteCampaign,  changeStatus, queryUSDTPrice, queryWalletBalance,toMakePledge,toMakeCampaignStatusChange, toMakeNoPending } from 'services/campaign'
import {checkTXHash, checkUserInfo} from 'services/wallet'
import { queryAll as queryAdvAll } from 'services/advertiser'
import { pageModel } from './common'
import { isWalletAvaliable, getAccount} from 'services/dapi'
import eventEmitter from '../utils/eventEmitter'
import { getAppType } from 'utils'

const formatPrice = (priceInCent) => {
    priceInCent = parseInt(priceInCent, 10)
    return parseFloat((priceInCent / 100).toFixed(2))
}

const transformData = item => ({
    ...item,
    priceInDollar: item.price / 100,
    priceStr: `${formatPrice(item.price / 100)} adc`,
    start_time_obj: moment(item.start_time),
    end_time_obj: moment(item.end_time),
    country_obj: {
        country: item.country,
        all: !(item.country || []).length,
    },
})

const initialState =  {
    currentItem: {},
    modalVisible: false,
    modalType: 'create',
    selectedRowKeys: [],
    slotList: [],
    filter: {},
    advList: [], // for admin
    usdt:0
}

export default modelExtend(pageModel, {
    namespace: 'campaign',

    state: initialState,

    subscriptions: {
        setup ({ dispatch, history }) {
            history.listen((location) => {
                if (location.pathname === '/campaign') {
                    const currentDate = moment().format('YYYY-MM-DD HH:mm:ss')
                    const payload = location.query || { page: 1, pageSize: 10,begin: 0, end_time:currentDate }
                    dispatch({
                        type: 'query',
                        payload,
                    })
                } else if (location.pathname === '/login') {

                }
            })

            eventEmitter.on('logout', () => {
                dispatch({
                    type: 'reset',
                })
            })
        },
    },

    effects: {

        * query ({ payload }, { call, put, select }) {
            const { isAdmin } = yield select(_ => _.app)
            const { slotList, filter = {}, advList } = yield select(_ => _.campaign)

            // if (!(slotList && slotList.length)) {
            //     yield put({
            //         type: 'querySlots',
            //     })
            // }

            // if (isAdmin && !(advList && advList.length)) {
            //     yield put({
            //         type: 'queryAdvs',
            //     })
            // }

            const _payload = {
                ...filter,
                ...payload,
            }


            yield put({
                type: 'setFilter',
                payload: _payload,
            })
            const data = yield call(queryCampaignList, _payload)
            if(data.code === 1001){
                message.error('Already logout, please login again.');
                yield put({type:'reset'})
                yield put({type:'app/redirectToLogin'})
                return
            }


            data.data = data.result.items;
            data.recordsFiltered = data.result.total_count;
            if (data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: (data.data || []).map(item => transformCampQueryData(item)),
                        pagination: {
                            current: Number(_payload.page) || 1,
                            pageSize: Number(_payload.pageSize) || 10,
                            total: data.recordsFiltered,
                        },
                    },
                })
            }
        },

        //没用
        * queryAdvs ({ payload = {} }, { call, put }) {
            try {
                const data = yield call(queryAdvAll, payload)
                if (data) {
                    yield put({
                        type: 'queryAdvsSuccess',
                        payload: {
                            list: data.data || [],
                        },
                    })
                }
            } catch (e) {
                message.error('Advertisers query fails, please click search and try again')
            }
        },

        //没用
        * delete ({ payload }, { call, put, select }) {
            const data = yield call(remove, { camp_id: payload })
            const { selectedRowKeys, pagination } = yield select(_ => _.campaign)
            if (data.success) {
                yield put({
                    type: 'updateState',
                    payload: { selectedRowKeys: selectedRowKeys.filter(_ => _ !== payload) },
                })
                yield put({ type: 'query', payload: { page: pagination.current, pageSize: pagination.pageSize } })
            } else {
                throw data
            }
        },

        //没用
        * duplicate ({ payload }, { call, put, select }) {
            const data = yield call(duplicate, { camp_id: payload })
            const { pagination } = yield select(_ => _.campaign)
            if (data.success) {
                yield put({ type: 'query', payload: { page: 1, pageSize: pagination.pageSize } })
            } else {
                throw data
            }
        },

        * create ({ payload }, { call, put, select }) {
            const available = yield call(checkUserInfo);
            if(available.code === 1001){
                message.error('Already logout, please login again.');
                yield put({type:'reset'})
                yield put({type:'app/redirectToLogin'})
                return
            }

            const walletInfo = yield call(isWalletAvaliable)
            if(!walletInfo){//钱包未安装或者禁用
                yield put({type:'app/openDownloadModel'});
                return false
            }
            const sessionData = JSON.parse(sessionStorage.getItem('loginState'));
            const accountInfo = yield call(getAccount)
            if(accountInfo.code === 3){//未登录钱包
                yield put({type:'app/openWarningModel', payload:{text:'Operation failed! This address is not logged into your Wallet. Please log in.'}});
                return false
            }
            if(accountInfo.code === 2){//钱包超时登出
                yield put({type:'app/openWarningModel', payload:{text:'Operation failed! Timed out, logged out of Wallet.'}});
                return false
            }
            if(accountInfo.code === 1){//未知错误
                yield put({type:'app/openWarningModel', payload:{text:'Operation failed! Unknown error.'}});
                return false
            }

            if(accountInfo.result.value != sessionData.result.wallet_address){//当前钱包账户与登录不一致

                yield put({type:'app/openWarningModel', payload:{text:'The current Wallet is not the same as the one you logged in with.'}});
                return false
            }
            const { pagination } = yield select(_ => _.campaign);

            const walletBalance = yield call(queryWalletBalance, sessionData.result.wallet_address);

            if(walletBalance && walletBalance.result.DAD >= payload.priceInDollar){
                const data = yield call(create, payload)
                if(data.code === 1001){
                    message.error('Already logout, please login again.');
                    yield put({type:'reset'})
                    yield put({type:'app/redirectToLogin'})
                    return
                }
                if (data.success) {

                    const input = {
                        token:'DAD',
                        orderID:data.result.id,
                        advertiser:sessionData.result.wallet_address,
                        bid:payload.priceInDollar * 1000000000
                    };
                    const pledge = yield call(toMakePledge, input);
                    if(pledge && pledge.code === 0&&pledge.result && pledge.result.code === 0){
                        message.success('Successfully confirmed!');
                        yield put({type: 'app/openLoading'})
                        const res = yield call(checkTXHash, pledge.result.result)


                        if(res){
                            yield put({type: 'app/closeLoading'})
                            yield put({ type: 'hideModal' })
                            message.success('Campaign created successfully');
                            const currentDate = moment().format('YYYY-MM-DD HH:mm:ss')
                            yield put({ type: 'query', payload: { page: pagination.current, pageSize: pagination.pageSize, end_time: currentDate} })
                        }else{
                            yield put({type:'app/openWarningModel', payload:{text:'Network error.'}});
                            yield put({type: 'app/closeLoading'})
                        }
                    }else{
                        if(pledge.code === 2){
                            message.error('Failed to confirm, please try again!');
                            yield put({type:'app/openWarningModel', payload:{text:'Please log in wallet.'}});
                            yield put({type: 'app/closeLoading'})
                        }else{
                            if(pledge.result && pledge.result.code === -1){
                                yield put({type: 'app/closeLoading'})
                            }else{
                                message.error('Failed to confirm, please try again!');
                                yield put({type:'app/openWarningModel', payload:{text:'Unknown error.'}});
                                yield put({type: 'app/closeLoading'})
                            }
                        }
                    }
                } else {
                    throw data
                }
            }else{
                yield put({type: 'app/openWarningModel', payload:{text:'Insufficient balance.'}})
            }
        },

        * placeAd({ payload }, { call, put, select }){
            const available = yield call(checkUserInfo);
            if(available.code === 1001){
                message.error('Already logout, please login again.');
                yield put({type:'reset'})
                yield put({type:'app/redirectToLogin'})
                return
            }


            const walletInfo = yield call(isWalletAvaliable)
            if(!walletInfo){//钱包未安装或者禁用
                yield put({type:'app/openDownloadModel'});
                return false
            }
            const sessionData = JSON.parse(sessionStorage.getItem('loginState'));
            const accountInfo = yield call(getAccount)
            if(accountInfo.code === 3){//未登录钱包
                yield put({type:'app/openWarningModel', payload:{text:'Operation failed! This address is not logged into your Wallet. Please log in.'}});
                return false
            }
            if(accountInfo.code === 2){//钱包超时登出
                yield put({type:'app/openWarningModel', payload:{text:'Operation failed! Timed out, logged out of Wallet.'}});
                return false
            }
            if(accountInfo.code === 1){//未知错误
                yield put({type:'app/openWarningModel', payload:{text:'Operation failed! Unknown error.'}});
                return false
            }

            if(accountInfo.result.value != sessionData.result.wallet_address){//当前钱包账户与登录不一致

                yield put({type:'app/openWarningModel', payload:{text:'The current Wallet is not the same as the one you logged in with.'}});
                return false
            }
            const { pagination } = yield select(_ => _.campaign);

            const walletBalance = yield call(queryWalletBalance, sessionData.result.wallet_address);

            if(walletBalance && walletBalance.result.DAD >= payload.priceInDollar){

                const input = {
                    token:'DAD',
                    orderID:payload.id,
                    advertiser:sessionData.result.wallet_address,
                    bid:payload.priceInDollar * 1000000000
                };
                const pledge = yield call(toMakePledge, input);
                if(pledge && pledge.code === 0&&pledge.result && pledge.result.code === 0){
                    message.success('Successfully confirmed!');
                    yield put({type: 'app/openLoading'})
                    const res = yield call(checkTXHash, pledge.result.result)

                    if(res){
                        yield put({type: 'app/closeLoading'})
                        yield put({ type: 'hideModal' })
                        message.success('Campaign created successfully');
                        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss')
                        yield put({ type: 'query', payload: { page: pagination.current, pageSize: pagination.pageSize, end_time: currentDate} })
                    }else{
                        yield put({type:'app/openWarningModel', payload:{text:'Network error.'}});
                        yield put({type: 'app/closeLoading'})
                    }
                }else{

                    if(pledge.code === 2){
                        message.error('Failed to confirm, please try again!');
                        yield put({type:'app/openWarningModel', payload:{text:'Operation failed! This address is not logged into your Wallet. Please log in.'}});
                        yield put({type: 'app/closeLoading'})
                    }else{
                        if(pledge.result && pledge.result.code === -1){
                            yield put({type: 'app/closeLoading'})
                        }else{
                            message.error('Failed to confirm, please try again!');
                            yield put({type:'app/openWarningModel', payload:{text:'Operation failed! Unknown error.'}});
                            yield put({type: 'app/closeLoading'})
                        }
                    }
                }

            }else{
                yield put({type: 'app/openWarningModel', payload:{text:'Not enough balance, please try again!'}})
            }
        },

        * update ({ payload }, { call, put, select }) {
            const { pagination } = yield select(_ => _.campaign);

            const data = yield call(update, payload);
            if(data.code === 1001){
                message.error('Already logout, please login again.');
                yield put({type:'reset'})
                yield put({type:'app/redirectToLogin'})
                return
            }


            if (data.success) {
                const currentDate = moment().format('YYYY-MM-DD HH:mm:ss')
                yield put({ type: 'hideModal' })
                yield put({ type: 'query', payload: { page: pagination.current, pageSize: pagination.pageSize, end_time: currentDate} })
            } else {
                throw data
            }
        },

        * deleteItem ({ payload }, { call, put, select }){
            const { pagination } = yield select(_ => _.campaign);

            const data = yield call(deleteCampaign, payload);
            if(data.code === 1001){
                message.error('Already logout, please login again.');
                yield put({type:'reset'})
                yield put({type:'app/redirectToLogin'})
                return
            }
            if (data.success) {
                const currentDate = moment().format('YYYY-MM-DD HH:mm:ss')
                yield put({ type: 'hideModal' })
                yield put({ type: 'query', payload: { page: pagination.current, pageSize: pagination.pageSize, end_time: currentDate} })
            } else {
                throw data
            }
        },

        * createSave ({ payload }, { call, put, select }) {
            const available = yield call(checkUserInfo);
            if(available.code === 1001){
                message.error('Already logout, please login again.');
                yield put({type:'reset'})
                yield put({type:'app/redirectToLogin'})
                return
            }
            const { pagination } = yield select(_ => _.campaign);
            const data = yield call(create, payload);
            if(data.code === 1001){
                message.error('Already logout, please login again.');
                yield put({type:'reset'})
                yield put({type:'app/redirectToLogin'})
                return
            }
            if (data.success) {
                const currentDate = moment().format('YYYY-MM-DD HH:mm:ss')
                yield put({ type: 'hideModal' })
                yield put({ type: 'query', payload: { page: pagination.current, pageSize: pagination.pageSize, end_time: currentDate} })
            } else {
                throw data
            }
        },

        * prepareEdit ({ payload: camp_id }, { call, put }) {
            const data = yield call(query, { camp_id, page:1, pageSize:10 });
            if(data.code === 1001){
                message.error('Already logout, please login again.');
                yield put({type:'reset'})
                yield put({type:'app/redirectToLogin'})
                return
            }
            // const price = yield call(queryUSDTPrice)
            let inputData = data.result.items[0];
            //inputData.usdt = price.result.price
            if (data) {
                yield put({
                    type: 'showModal',
                    payload: {
                        modalType: 'update',
                        currentItem: transformCampQueryData(inputData),
                    },
                })
            }
        },

        * handleUnpaid ({ payload: camp_id }, { call, put }){
            const data = yield call(query, { camp_id, page:1, pageSize:10 });
            if(data.code === 1001){
                message.error('Already logout, please login again.');
                yield put({type:'reset'})
                yield put({type:'app/redirectToLogin'})
                return
            }
            const price = yield call(queryUSDTPrice)
            let inputData = data.result.items[0];
            inputData.usdt = price.result.price
            if (data) {
                yield put({
                    type: 'showModal',
                    payload: {
                        modalType: 'unpaid',
                        currentItem: transformCampQueryData(inputData),
                    },
                })
            }
        },

        * onCreate({payload},{call,put}){
            const available = yield call(checkUserInfo);
            if(available.code === 1001){
                message.error('Already logout, please login again.');
                yield put({type:'reset'})
                yield put({type:'app/redirectToLogin'})
                return
            }

            const data = yield call(queryUSDTPrice)
            if(data.code === 1001){
                message.error('Already logout, please login again.');
                yield put({type:'reset'})
                yield put({type:'app/redirectToLogin'})
                return
            }
            if(data.success){
                yield put({
                    type: 'showModal',
                    payload: {
                        modalType: 'create',
                        currentItem:{usdt:data.result.price},
                    },
                })
            }
        },

        * makeNoPending({payload},{call,put,select}){
            const available = yield call(checkUserInfo);
            if(available.code === 1001){
                message.error('Already logout, please login again.');
                yield put({type:'reset'})
                yield put({type:'app/redirectToLogin'})
                return
            }


            const { pagination } = yield select(_ => _.campaign)
            const walletInfo = yield call(isWalletAvaliable)
            if(!walletInfo){//钱包未安装或者禁用
                yield put({type:'app/openDownloadModel'});
                return false
            }
            const sessionData = JSON.parse(sessionStorage.getItem('loginState'));
            const accountInfo = yield call(getAccount)
            if(accountInfo.code === 3){//未登录钱包
                yield put({type:'app/openWarningModel', payload:{text:'Operation failed! This address is not logged into your Wallet. Please log in.'}});
                return false
            }
            if(accountInfo.code === 2){//钱包超时登出
                yield put({type:'app/openWarningModel', payload:{text:'Operation failed! Timed out, logged out of Wallet.'}});
                return false
            }
            if(accountInfo.code === 1){//未知错误
                yield put({type:'app/openWarningModel', payload:{text:'Operation failed! Unknown error.'}});
                return false
            }

            if(accountInfo.result.value != sessionData.result.wallet_address){//当前钱包账户与登录不一致

                yield put({type:'app/openWarningModel', payload:{text:'The current Wallet is not the same as the one you logged in with.'}});
                return false
            }
            const input = {
                advertiser:payload.adv_id,
                adType:payload.payment_method,
                token:'DAD',
                bid:payload.bid,
                begin:payload.begin,
                expire:payload.end,
                orderID:payload.id,
                capaignName:payload.name,
                capaignLink:payload.link,
                contries:payload.country,
                slots:payload.platform_types,
                creative:payload.creative
            }
            const change = yield call(toMakeNoPending, input)
            if(change && change.code === 0 &&change.result && change.result.code === 0){
                message.success('Successfully confirmed!');
                yield put({type: 'app/openLoading'})
                const res = yield call(checkTXHash, change.result.result)
                if(res){
                    yield put({type: 'app/closeLoading'})
                    const currentDate = moment().format('YYYY-MM-DD HH:mm:ss')
                    yield put({ type: 'hideModal' })
                    yield put({ type: 'query', payload: { page: pagination.current, pageSize: pagination.pageSize, end_time: currentDate} })
                }else{
                    yield put({type:'app/openWarningModel', payload:{text:'Network error.'}});
                    yield put({type: 'app/closeLoading'})
                }
            }else{
                if(change.code === 2){
                    message.error('Failed to confirm, please try again!');
                    yield put({type:'app/openWarningModel', payload:{text:'Please log in wallet.'}});
                    yield put({type: 'app/closeLoading'})
                }else{
                    if(change.result && change.result.code === -1){
                        yield put({type: 'app/closeLoading'})
                    }else{
                        message.error('Failed to confirm, please try again!');
                        yield put({type:'app/openWarningModel', payload:{text:'Unknown error.'}});
                        yield put({type: 'app/closeLoading'})
                    }
                }
            }

        },

        * changeStatus ({ payload }, { call, put, select }) {
            const available = yield call(checkUserInfo);
            if(available.code === 1001){
                message.error('Already logout, please login again.');
                yield put({type:'reset'})
                yield put({type:'app/redirectToLogin'})
                return
            }

            const walletInfo = yield call(isWalletAvaliable);
            if(!walletInfo){//钱包未安装或者禁用
                yield put({type:'app/openDownloadModel'});
                return false
            }
            const sessionData = JSON.parse(sessionStorage.getItem('loginState'));
            const accountInfo = yield call(getAccount);
            if(accountInfo.code === 3){//未登录钱包
                yield put({type:'app/openWarningModel', payload:{text:'Operation failed! This address is not logged into your Wallet. Please log in.'}});
                return false
            }
            if(accountInfo.code === 2){//钱包超时登出
                yield put({type:'app/openWarningModel', payload:{text:'Operation failed! Timed out, logged out of Wallet.'}});
                return false
            }
            if(accountInfo.code === 1){//未知错误
                yield put({type:'app/openWarningModel', payload:{text:'Operation failed! Unknown error.'}});
                return false
            }

            if(accountInfo.result.value != sessionData.result.wallet_address){//当前钱包账户与登录不一致

                yield put({type:'app/openWarningModel', payload:{text:'The current Wallet is not the same as the one you logged in with.'}});
                return false
            }
            const { pagination } = yield select(_ => _.campaign)
            const change = yield call(toMakeCampaignStatusChange, {orderID:payload.camp_id, status:payload.status})
            if(change && change.code ===0 &&change.result && change.result.code === 0){
                message.success('Successfully confirmed!');
                yield put({type: 'app/openLoading'})
                const res =  yield call(checkTXHash, change.result.result)
                if(res){
                    // yield put({ type: 'hideModal' })
                    const currentDate = moment().format('YYYY-MM-DD HH:mm:ss')
                    yield put({type: 'app/closeLoading'})
                    yield put({ type: 'query', payload: { page: pagination.current, pageSize: pagination.pageSize, end_time: currentDate } })
                }else{
                    yield put({type:'app/openWarningModel', payload:{text:'Network error.'}});
                    yield put({type: 'app/closeLoading'})
                }
            }else{
                if(change.code === 2){
                    message.error('Failed to confirm, please try again!');
                    yield put({type:'app/openWarningModel', payload:{text:'Please log in wallet.'}});
                    yield put({type: 'app/closeLoading'})
                }else{
                    if(change.result && change.result.code === -1){
                        yield put({type: 'app/closeLoading'})
                    }else{
                        message.error('Failed to confirm, please try again!');
                        yield put({type:'app/openWarningModel', payload:{text:'Unknown error.'}});
                        yield put({type: 'app/closeLoading'})
                    }
                }
            }

        },
    },

    reducers: {
        setFilter (state, { payload }) {
            return { ...state, filter: payload }
        },

        querySlotsSuccess (state, { payload }) {
            return { ...state, slotList: payload.list }
        },

        queryAdvsSuccess (state, { payload }) {
            return { ...state, advList: payload.list }
        },

        showModal (state, { payload }, call) {
            return { ...state, ...payload, modalVisible: true }
        },

        hideModal (state) {
            return { ...state, modalVisible: false }
        },

        reset (state) {
            return {
                ...state,
                ...initialState,
            }
        },

    },
})

function transformCampQueryData(item){
    item.startTime = item.begin
    item.endTime = item.end
    item.camp_name = item.name
    item.end_time = item.end;
    item.start_time = item.begin;
    item.camp_url = item.link
    item.camp_id = item.id
    item.app_desc = item.desc
    item.slot_ids = item.platform_types

    item.slotIds = item.platform_types
    item.status = getAppType(item.status)
    return item
}
