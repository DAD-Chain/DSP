import { routerRedux } from 'dva/router'
import { login,getToken,getSignMessage,getAccountInfo, signup } from 'services/login'
import {queryIsWalletAvailable} from 'services/wallet'

import { Modal, message } from 'antd'
import { getDefaultEntrance } from 'services/app'

export default {
    namespace: 'login',

    state: {
        showDonwloadModel: false,
        showWarningModel:false,
        showSignupModel: false,
        warningModelText:''
    },

    effects: {
        * login ({
            payload,
        }, { put, call, select }) {


            const wallet = yield call(queryIsWalletAvailable);
            if(!wallet){
                yield put({type:'openDownloadModel'});
                return
            }

            const account = yield call(getAccountInfo);

            if(account.code !==0){
                if(account.code === 3){//未登录钱包
                    yield put({type:'openWarningModel', payload:{text:'Operation failed! This address is not logged into your Wallet. Please log in.'}});
                    return false
                }
                if(account.code === 2){//钱包超时登出
                    yield put({type:'openWarningModel', payload:{text:'Operation failed! Timed out, logged out of Wallet.'}});
                    return false
                }
                if(account.code === 1){//未知错误
                    yield put({type:'openWarningModel', payload:{text:'Operation failed! Unknown error.'}});
                    return false
                }
                return
            }
            const token = yield call(getToken);
            const sign = yield call(getSignMessage, token.result.token)
            if(sign.code !==0){
                yield put({type:'openWarningModel', payload:{text:'Operation failed! This address is not logged into your Wallet. Please log in.'}});
                return
            }
            const data = yield call(login, {
                public_key:sign.result.publicKey,
                sign_message:sign.result.data,
                wallet_address:account.result.value
            })
            const { locationQuery, user } = yield select(_ => _.app)
            if (data.success) {
                if(data.code === 0){
                    const { from } = locationQuery
                    if(data.result.role === 'PUBLISHER'){
                        yield put({type:'openWarningModel', payload:{text:'This account register as advertiser, please log your account at ssp.'}});
                    }else{
                        payload = data
                        payload.user = data.result.role;

                        yield put({ type: 'app/query' , payload})
                    }

                }else{
                    yield put({type:'openWarningModel', payload:{text:'The account does not exist.'}});
                }
            } else {
                throw data
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
        * signup({payload}, {call, put, select}){
            const data = yield call(signup, payload)
            console.log('sigup apply return', data)
            if(data.success){
                if(data.code == 0){
                    message.success('Submitted successfully, we will contact you as soon as possible!');
                    yield put({type:'closeSignupModel'})
                }else{
                    message.error(data.msg)
                }
            }else{
                throw data
            }
        },
        * openSignupModel({}, { call, put, select }){
            yield put({ type: 'switchSignupModel', payload: true })
        },

        * closeSignupModel({}, { call, put, select }){
            yield put({ type: 'switchSignupModel', payload: false })
        },

    },

    reducers: {
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
        switchSignupModel (state, { payload }){
            return {
                ...state,
                showSignupModel: payload,
            }
        },
    }

}
