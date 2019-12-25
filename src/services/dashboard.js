import { request, config, getBeginTime, getEndTime } from 'utils'
import moment from 'moment'
const { api } = config;
const { dashboard } = api;

export async function query (params) {
    return request({
        url: dashboard,
        method: 'get',
        data: transFormData(params),
    })
}

function transFormData(data){

    if(data.start_time){
        data.begin = moment(data.start_time).valueOf();
    }else{
        if(!data.begin){
            data.begin = 0
        }
    }
    if(data.end_time){
        data.end = moment(data.end_time).valueOf();
    }else{
        if(!data.end){
            data.end = moment().valueOf()
        }
    }
    data.timezone = -(new Date().getTimezoneOffset()/60);

    return data
}
