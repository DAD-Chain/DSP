import { parse } from 'qs'
import modelExtend from 'dva-model-extend'
import { query } from 'services/dashboard'
import { model } from 'models/common'
import moment from 'moment'
import { message } from 'antd'
import * as weatherService from 'services/weather'
import { dateToTimeStarp,getCurrentTime,getChartData } from 'utils'
export default modelExtend(model, {
    namespace: 'dashboard',
    state: {
        sales: [],
        quote: {
            avatar: 'http://img.hb.aicdn.com/bc442cf0cc6f7940dcc567e465048d1a8d634493198c4-sPx5BR_fw236',
        },
        menuSelect:'Click',
        numbers: [],
        recentSales: [],
        comments: [],
        completed: [],
        browser: [],
        cpu: {},
        user: {
            avatar: 'http://img.hb.aicdn.com/bc442cf0cc6f7940dcc567e465048d1a8d634493198c4-sPx5BR_fw236',
        },
    },
    subscriptions: {
        setup ({ dispatch, history }) {
            history.listen((location) => {
                const pathname = location.pathname;
                let payload = {};
                if(location.query){
                    payload.start_time = location.query.start_time
                    payload.end_time = location.query.end_time
                }else{
                    payload.start_time = 0;
                    payload.end_time = moment().format('YYYY-MM-DD');
                }

                if (pathname === '/dashboard' || pathname === '/') {

                    dispatch({
                        type: 'query',
                        payload
                     })
                    // dispatch({ type: 'queryWeather' })
                }
            })
        },
    },
    effects: {
        * query ({
            payload,
        }, { call, put,select }) {
            const {filter = {}} = yield select(_ => _.dashboard);

            const data = yield call(query, parse(payload))
            if(data.code === 1001){
                message.error('Already logout, please login again.');
                yield put({type:'app/redirectToLogin'})
                return
            }


            getNumberCard(data)
            data.sales = {
                click:[],
                cr:[]
            }
            data.sales.click = getChartData(data.result.clicks_data);
            data.sales.cr = getChartData(data.result.click_rate_data);

            yield put({
                type: 'updateState',
                payload: data,
            })
        },
        * queryWeather ({
            payload = {},
        }, { call, put }) {
            payload.location = 'shenzhen'
            const result = yield call(weatherService.query, payload)
            const { success } = result
            if (success) {
                const data = result.results[0]
                const weather = {
                    city: data.location.name,
                    temperature: data.now.temperature,
                    name: data.now.text,
                    icon: `//s5.sencdn.com/web/icons/3d_50/${data.now.code}.png`,
                }
                yield put({
                    type: 'updateState',
                    payload: {
                        weather,
                    },
                })
            }
        },
        * setMenuSelect({payload}, { call, put, select }){
            const { sales } = yield select(_ => _.dashboard)

            // const menuSelect =
            // yield put({
            //     type: 'updateState',
            //     payload: {
            //         menuSelect:menuSelect,
            //         sales: [
            //             {name: 2008, Click: 311, ClickRate: 25, CostPerClick: 510},
            //             {name: 2009, Click: 215, ClickRate: 15, CostPerClick: 469},
            //             {name: 2010, Click: 245, ClickRate: 65, CostPerClick: 342},
            //             {name: 2011, Click: 375, ClickRate: 95, CostPerClick: 503},
            //             {name: 2012, Click: 295, ClickRate: 75, CostPerClick: 418},
            //             {name: 2013, Click: 235, ClickRate: 12, CostPerClick: 331},
            //             {name: 2014, Click: 295, ClickRate: 98, CostPerClick: 445},
            //             {name: 2015, Click: 435, ClickRate: 31, CostPerClick: 397},
            //         ]
            //     },
            // })
        }

    },
    reducers:{

        // setMenuSelect({ payload }){
        //     // console.log(payload)
        //     // return { ...state, menuSelect: payload }
        // }
    }
})

function getNumberCard(data){
    data.numbers = [
        {icon: "adv", color: "#64ea91", title: "Advertising Spent", number: 1*(data.result.dad_cost/1000000000).toFixed(2)},
        {icon: "clicks", color: "#8fc9fb", title: "Clicks", number: data.result.clicks},
        {icon: "cr", color: "#d897eb", title: "Clicks Rate", number: data.result.ctr},
        {icon: "cpc", color: "#f69899", title: "Cost Per Click", number: 1*(data.result.cost_per_clik/1000000000).toFixed(2)},
    ]
}

function getSalesData(data){

}
