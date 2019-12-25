const APIV1 = '/v1/api'
const APIV2 = '/api/v2'

module.exports = {
    name: 'DAD',
    prefix: 'dad',
    footerText: '',
    logo: '/logo.ico',
    iconFontCSS: '/iconfont.css',
    iconFontJS: '/iconfont.js',
    CORS: [],
    openPages: ['/login'],
    apiPrefix: '/api/v1',
    APIV1,
    APIV2,
    api: {
        menus: `${APIV1}/menus`,
        userLogin: `${APIV1}/account/login`,
        userSignup: `${APIV1}/account/apply`,
        token: `${APIV1}/account/token`,
        userLogout: `${APIV1}/account/logout`,
        checkTx : `${APIV1}/tx/status/check/:id`,
        applications: `${APIV1}/application/search`,
        application: `${APIV1}/application/search`,
        applicationCreate: `${APIV1}/application/create`,
        applicationUpdate: `${APIV1}/application/update`,
        slots: `${APIV1}/application/slots/`,
        slot: `${APIV1}/slots/get`,
        slotCreate:`${APIV1}/slots/create`,
        changeSlotStatus:`${APIV1}/slots/change_status`,
        slotUpdate:`${APIV1}/slots/update`,
        campaigns: `${APIV1}/campaign/search`, // 投放列表
        campaign: `${APIV1}/campaign/search`, // 单个投放
        campaignReport: `${APIV1}/campaign/report`, // 投放报表
        campaignCreate:`${APIV1}/campaign/create`,
        campaignUpdate:`${APIV1}/campaign/update`,
        usdtPrice: `${APIV1}/asset/dad/last-price`,
        slotReport: `${APIV1}/slots/report`, // 广告位报表
        advertisers: `${APIV1}/advertiser`, // 广告主列表
        publishers: `${APIV1}/publisher`, // 媒体列表
        userInfo: `${APIV1}/account/my/info`,
        campaignDelete: `${APIV1}/campaign/delete/:id`,
        applicationDelete: `${APIV1}/application/delete/:id`,

        // affiliate: `${APIV1}/affiliate`,
        // advertiser: `${APIV1}/advertiser`,
        // trackingSystem: `${APIV1}/tracking-system`,
        // report: `${APIV1}/report`,

        users: `${APIV1}/users`,
        user: `${APIV1}/user/:id`,
        dashboard: `${APIV1}/campaign/dashboard/search`,
        weather: `${APIV1}/weather`,
        v1test: `${APIV1}/test`,
        v2test: `${APIV2}/test`,
        walletDownloadAddr: 'https://chrome.google.com/webstore/detail/dad-wallet/dmjofghfefcmcmaoggmlckpjepdkdkgd?hl=en'
    },
}
