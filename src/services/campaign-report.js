/**
 * campaign report
 *
 * @author hyczzhu
 */

import { request, config, getBeginTime, getEndTime, getTimeWithTZ } from 'utils'
import moment from 'moment/moment'
const { api } = config
const { campaignReport } = api


export async function queryList (params) {

    return request({
        url: campaignReport,
        method: 'get',
        data: translateData(params),
    })
}

// const formatPrice = (priceInCent) => {
//     priceInCent = parseInt(priceInCent, 10)
//     return parseFloat((priceInCent / 100).toFixed(2))
// }

export const transformData = (item) => {
    let { impressions, clicks } = item
    impressions = parseInt(impressions, 10)
    clicks = parseInt(clicks, 10)
    item.camp_id = item.campaign_id
    item.camp_name = item.campaign_name
    item.platforms = item.platform_type
    item.spent = (item.spent/1000000000).toFixed(2)*1;
    let array ='';
    item.platforms.map(value => {
        switch (value) {
            case 'PC_WEB':
                array += 'PC WEB'
                break;
            case 'MOBILE_WAP':
                array += 'MOBILE WEB'
                break;
            case 'MOBILE_APP':
                array += 'MOBILE APP'
                break;
        }
    });
    item.platformsForXlsx = array;

    return {
        ...item,
        impressions: item.impression,
        clicks,
        ctr: (item.ctr * 100).toFixed(2), // eslint-disable-line
    }
}

export const translateData = (data) => {
    data.page_number = data.page;
    data.page_size = data.pageSize;
    if(data.start_date){
        data.begin = moment.utc(data.start_date).valueOf() - (data.timezone * 60 * 60 * 1000);
    }else{
        data.begin = 0
    }
    if(data.end_date){
        data.end = moment.utc(data.end_date).add(1, 'd').valueOf() - (data.timezone * 60 * 60 * 1000);
    }else{
        data.end = moment().valueOf()
    }
    if(data.platform === 'all'){
        data.platform =''
    }
    if(data.camp_id){
        data.campaign_id = data.camp_id
    }else{
        data.campaign_id = ''
    }

    return data
}

