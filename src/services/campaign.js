/**
 * offer
 *
 * @author hyczzhu
 */
import { request, config, getBeginTime, getEndTime } from 'utils'
import {getBalance, makePledge,makeCampaignStatusChange, makeNoPending} from 'services/dapi'
import moment from 'moment'
const { api } = config
const { campaigns, campaign,usdtPrice, campaignCreate, campaignUpdate, campaignDelete} = api

export async function  queryWalletBalance(data){
    return await getBalance(data)
}

export async function toMakePledge(data){
    return await makePledge(data)
}

export async function toMakeCampaignStatusChange(data){
    return await makeCampaignStatusChange(data)
}

export async function toMakeNoPending(data){
    return await makeNoPending(data)
}

export async function deleteCampaign(data){
    return request({
        url: campaignDelete.replace('/:id', '/'+data.camp_id),
        method: 'delete',
        data: '',
    })
}


export async function queryList (params) {
    return request({
        url: campaigns,
        method: 'get',
        data: translateSearchData(params),
    })
}

export async function query (params) {
    params.page_number = params.page;
    params.campaign_id = params.camp_id;
    params.page_size = params.pageSize;
    return request({
        url: campaign,
        method: 'get',
        data: params,
    })
}

export async function queryUSDTPrice(){
    return request({
        url: usdtPrice,
        method: 'get',
        data: '',
    })
}


export async function create (params) {
    return request({
        url: campaignCreate,
        method: 'post',
        data: translateCreateData(params),
    })
}

export async function remove (params) {
    return request({
        url: campaign,
        method: 'delete',
        data: params,
    })
}

export async function update (params) {
    return request({
        url: campaignUpdate,
        method: 'post',
        data: translateCreateData(params),
    })
}

export async function duplicate (params) {
    return request({
        url: `${campaign}/duplicate`,
        method: 'post',
        data: params,
    })
}

export async function changeStatus (params) {
    return request({
        url: `${campaign}/status`,
        method: 'put',
        data: params,
    })
}

function translateSearchData(data){

    if(data.start_time){
        data.begin = moment.utc(data.start_time).valueOf()
    }else{
        data.begin = 0
    }
    if(data.end_time){
        data.end = getEndTime(moment.utc(data.end_time).format("YYYY-MM-DD"))
    }else{
        data.end = moment().valueOf()
    }
    if(data.camp_id){
        data.campaign_id = data.camp_id
    }else{
        data.campaign_id = ''
    }
    if(data.camp_name){
        data.campaign_name = data.camp_name
    }else{
        data.campaign_name = ''
    }
    data.page_number = data.page ? data.page : 1;
    data.page_size = data.pageSize ? data.pageSize : 10;
    if(data.status){
        switch(data.status){
            case 'active':
            data.status = 'CAMPAIGN_STATUS_ACTIVE'
            break;
            case 'done':
            data.status = 'CAMPAIGN_STATUS_DONE'
            break;
            case 'pending':
            data.status = 'CAMPAIGN_STATUS_PENDING'
            break;
            case 'paused':
            data.status = 'CAMPAIGN_STATUS_PAUSED'
            break;
            case 'unpaid':
            data.status = 'CAMPAIGN_STATUS_UNPAID'
            break;
            case 'all':
            data.status = ''
            break;
        }
    }
    return data
}

function translateCreateData(data){
    data.begin = data.start_time;
    data.end = data.end_time;
    if(data.country.length === 0){
        data.country = ['ALL']
    }
    if(data.app_desc){
        data.desc = data.app_desc
    }
    if(data.camp_id){
        data.id = data.camp_id
    }

    if(data.priceInDollar){
        data.bid = data.priceInDollar * 1000000000
    }

    data.name = data.camp_name
    data.link = data.camp_url
    data.platform_types = data.slot_ids
    let new_platform = []
    for(let i=0; i<data.slot_ids.length; i++){
        switch(data.slot_ids[i]){
            case 'Mobile Wap':
            new_platform.push('MOBILE_WAP')
            break;
            case 'Mobile App':
            new_platform.push('MOBILE_APP')
            break;
            case 'PC Web':
            new_platform.push('PC_WEB')
            break;
        }
    }
    data.platform_types = new_platform;

    if(data.creative){
        let new_create = []
        for(let i=0; i<data.creative.length; i++){
            let pointer = JSON.parse(data.creative[i]);
            new_create.push(pointer.url)
        }
        data.creative = new_create;
    }

    return data
}

function endAdding(){

}
