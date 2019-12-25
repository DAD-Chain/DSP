import { request, config } from 'utils'
import {signMessage, getAccount} from 'services/dapi'
const { api } = config
const { userLogin,token, userSignup } = api

export async function login (data) {
    const ADVERTISER = {
        "public_key": "2",
        "sign_message": "2",
        "wallet_address": "ATdX8jx2Zc9yqqgeu24xVRzqT7GJ5MAqTE"
    }
    const PUBLISHER = {
        "public_key": "1",
        "sign_message": "1",
        "wallet_address": "AQiGGfoMdYQM6Pwr8xrKAWV7ibfvrinqsv"
    }
    return request({
        url: userLogin,
        method: 'post',
        data:data
    })
}

export async function signup (data){
    return request({
        url: userSignup,
        method: 'post',
        data:data
    })
}

export async function getToken(){
    return request({
        url: token,
        method: 'post',
        data:''
    })
}

export async function getSignMessage(data){
    return await signMessage({message:data})
}

export async function getAccountInfo(){
    return await getAccount()
}
