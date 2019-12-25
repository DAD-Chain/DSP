/**
 * PLATFORM
 *
 * @author hyczzhu
 */
const PLATFORM = {
    PC_WEB: 'PC_WEB',
    WAP_WEB: 'MOBILE_WAP',
    MOBILE_APP: 'MOBILE_APP',
}

const PLATFORM_STRING = {
    [PLATFORM.PC_WEB]: 'PC Web',
    [PLATFORM.WAP_WEB]: 'Mobile Wap',
    [PLATFORM.MOBILE_APP]: 'Mobile App',
}

export const PLATFORM_LIST = Object.keys(PLATFORM).map(t => PLATFORM[t])

export const toString = v => PLATFORM_STRING[v] || 'Unknown'

export default PLATFORM
