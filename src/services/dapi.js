import { client } from 'dad-dapi'

/**
 *  确认插件安装与否: true/false
 */
export async function isWalletAvaliable() {
    try {
        let res = await client.api.provider.getProvider()
        console.log(`get provider ok: ${JSON.stringify(res)}`)
        return true
    } catch (error) {
        console.log(`get provider fail: ${error.message}`)
        return false
    }
}

/**
 * 获取钱包插件默认账户，返回数据格式
 * {
 *  code: 0,
 *  result: address
 * }
 */
export async function getAccount() {
    try {
        let res = await client.api.asset.getAccount()
        console.log(`get account ok: ${JSON.stringify(res)}`)
        return {
            code: 0,
            result: res,
        }
    } catch (error) {
        console.log(`get account fail: ${error}`)
        let code = 1
        if (error === 'TIME_OUT') {
            code = 2
        } else if (error === 'NO_ACCOUNT') {
            code = 3
        }
        return {
            code,
            result: error,
        }
    }
}

/**
 * 获取某个地址的余额， 返回格式，
 * {
 *  code: 0,
 *  result: balance
 * }
 * @param {*} address
 */
export async function getBalance(address) {
    try {
        let res = await client.api.network.getBalance({ address })
        console.log(`get balance ok: ${JSON.stringify(res)}`)
        return {
            code: 0,
            result: res,
        }
    } catch (error) {
        console.log(`get balance fail: ${error}`)
        return {
            code: 1,
            result: error.message,
        }
    }
}


/**
 * 通用合约调用接口，
 * {
 *  code: 0,
 *  result
 * }
 * @param opertion string, 智能合约名 (makePledgeTx, makeChangeStatusOrderPlacedTx, makePlaceADTx, makeContributeTx, makePlacePublisherTx, makeChangeAppStatusTx)
 * @param args json object , 智能合约参数
 */
export async function invokeSmartContract({ operation, args }) {
    if (typeof args !== 'object') {
        return Promise.reject('ARGS TYPE ERROR')
    }
    args.host = window.location.host;
    try {
        args = JSON.stringify(args)
        let res = await client.api.dadContract.invoke({ operation, args })
        console.log(`invoke ok: ${JSON.stringify(res)}`)
        return {
            code: 0,
            result: res,
        }
    } catch (error) {
        console.log(`invoke fail: ${error}`)
        let code = 1
        if (error === 'PK ERROR') {
            code = 2
        }
        return {
            code,
            result: error.message,
        }
    }
}

/**
 * 质押调用接口，
 * {
 *  code: 0,
 *  result
 * }
 * @param {*} address
 */
export async function makePledge({ token, advertiser, bid, orderID }) {
    let operation = 'makePledgeTx'
    let args = {
        token,
        advertiser,
        bid,
        orderID,
    }



    return await invokeSmartContract({ operation, args })
}

export async function makeNoPending({ advertiser,adType,token,bid,begin,expire,orderID,capaignName,capaignLink,contries,slots,creative, }) {
    let operation = 'makePlaceADTx'
    let args = {
        advertiser,
        adType,
        token,
        bid,
        begin,
        expire,
        orderID,
        capaignName,
        capaignLink,
        contries,
        slots,
        creative,
    }

    return await invokeSmartContract({ operation, args })
}


export async function makeCampaignStatusChange({ orderID, status }) {
    let operation = 'makeChangeStatusOrderPlacedTx'
    status = status == 'active' ? 1 : 0
    let args = {
        orderID,
        status
    }
    return await invokeSmartContract({ operation, args })
}

export async function makeApp(data) {
    let operation = 'makePlacePublisherTx'
    let args = {}
    if(data.webwapType){
        args = {
            appType:data.appType,
            webwapType:data.webwapType,   
        }
    }
    if(data.appTypeApp){
        args = {
            appType:data.appType,
            appTypeApp:data.appTypeApp,   
        }
    }

    console.log(args)

    return await invokeSmartContract({ operation, args })
}

export async function makeAppStatusChange({ orderID, status }) {
    let operation = 'makeChangeAppStatusTx'
    status = status == 'active' ? 1 : 0
    let args = {
        orderID,
        status
    }
    console.log(args)
    return await invokeSmartContract({ operation, args })
}

/**
 * 获取某个地址的余额， 返回格式，
 * {
 *  code: 0,
 *  result: Signature
 * }
 * @param {*} address
 */
export async function signMessage({ message }) {
    try {
        let res = await client.api.message.signMessage({ message })
        console.log(`sign message ok: ${JSON.stringify(res)}`)
        return {
            code: 0,
            result: res,
        }
    } catch (error) {
        console.log(`sign message fail: ${error}`)
        return {
            code: 1,
            result: error.message,
        }
    }
}