import { request, config } from 'utils'

const { api } = config
const { menus } = api
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


export async function query (params) {
    // return request({
    //     url: menus,
    //     method: 'get',
    //     data: params,
    // })
    let res = []

    if (params.role === 'PUBLISHER') {
        res.push(visitPage.Application)
        res.push(visitPage.SlotReport)
        res.push(visitPage.Slots)
    } else if (params.role === 'ADVERTISER') {
        res.push(visitPage.DashBoard)
        res.push(visitPage.Campaign)
        res.push(visitPage.CampaignReport)
    }

    return res
}
