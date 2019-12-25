import {signMessage, getAccount, isWalletAvaliable} from 'services/dapi'
import { request, config } from 'utils'
const { api } = config
const {checkTx, userInfo} = api

export async function checkTXHash(hash){
    try{
        var check = await request({
            url: checkTx.replace('/:id', '/'+hash),
            method: 'get',
            data: '',
        })
        if(check.code!==0){
            return true
        }else{
            if(check.result.done){
                return true
            }else{
                await timeout(2000)
                let data = await checkTXHash(hash);
                return data;
            }
        }
    }catch(err){

    }
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export async function queryIsWalletAvailable(){
    const data = await isWalletAvaliable()
    return data
}

export async function checkUserInfo(){
    return await request({
        url: userInfo,
        method: 'post',
        data: '',
    })
}
