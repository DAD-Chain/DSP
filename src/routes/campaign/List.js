import React from 'react'
import PropTypes from 'prop-types'
import { Table, Modal } from 'antd'
import cn from 'classnames'
import moment from 'moment'
import { DropOption } from 'components'
import queryString from 'query-string'
import AnimTableBody from 'components/DataTable/AnimTableBody'
import styles from './List.less'
import { toString as platformToString } from '../../constants/PLATFORM'

const confirm = Modal.confirm

const List = ({ isAdmin, onDuplicateItem, onDeleteItem, onEditItem, onEditUnpaidItem, onChangeStatus, onNoPending, isMotion, location, slotList = [], ...tableProps }) => {
    location.query = queryString.parse(location.search)



    const handleMenuClick = (record, e) => {
        switch (e.key) {
            case '1':
                onEditItem(record)
                break
            case '2': {
                confirm({
                    title: (
                        <div style={{ fontWeight: 'initial' }}>
                            {'Are you sure you want to delete this campaign?'}
                            <br /><br />
                            {'Campaign Name: '}{record.camp_name}<br />{'Description: '}{record.desc}</div>
                    ),
                    onOk () {
                        onDeleteItem(record.camp_id)
                    },
                })
                break
            }
            case '3': {
                confirm({
                    title: (
                        <div style={{ fontWeight: 'initial' }}>
                            {'Are you sure you want to duplicate this campaign??'}
                            <br /><br />
                            {'Campaign: '}{record.camp_name}<br />{'Description: '}{record.desc}
                        </div>
                    ),
                    onOk () {
                        onDuplicateItem(record.camp_id)
                    },
                })
                break
            }
            case '4': {
                confirm({
                    title: (
                        <div style={{ fontWeight: 'initial' }}>
                            {'Are you sure you want to activate this campaign?'}
                            <br /><br />
                            {'Campaign Name: '}{record.camp_name}<br />{'Description: '}{record.desc}
                        </div>
                    ),
                    onOk () {
                        onChangeStatus(record.camp_id, 'active')
                    },
                })
                break
            }
            case '5': {
                confirm({
                    title: (
                        <div>
                            {'Are you sure you want to pause this campaign?'}
                            <br /><br />
                            {'Campaign Name: '}{record.camp_name}<br />{'Description: '}{record.desc}
                        </div>
                    ),
                    onOk () {
                        onChangeStatus(record.camp_id, 'paused')
                    },
                })
                break
            }
            case '8': {
                confirm({
                    title: (
                        <div>
                            {'Are you sure you want to activate this campaign?'}
                            <br /><br />
                            {'Campaign Name: '}{record.camp_name}<br />{'Description: '}{record.desc}
                        </div>
                    ),
                    onOk () {
                        onNoPending(record)
                    },
                })
                break
            }
            case '9': {
                confirm({
                    title: (
                        <div>
                            {'Are you sure you want to pause this campaign?'}
                            <br /><br />
                            {'Campaign Name: '}{record.camp_name}<br />{'Description: '}{record.desc}
                        </div>
                    ),
                    onOk () {
                        onNoPending(record)
                    },
                })
                break
            }
            case '11': {
                confirm({
                    title: (
                        <div>
                            {'Are you sure you want to delete this campaign?'}
                            <br /><br />
                            {'Campaign Name: '}{record.camp_name}<br />{'Description: '}{record.desc}
                        </div>
                    ),
                    onOk () {
                        onDeleteItem(record.camp_id)
                    },
                })
                break
            }
            case '10':
                onEditUnpaidItem(record.camp_id);
                break
            default:
        }
    }

    const slotMap = {}
    slotList.forEach((slot) => {
        slotMap[slot.slot_id] = slot
    })

    const columns = [
        ...(isAdmin ? [{
            title: 'Creator',
            key: 'creator',
            dataIndex: 'create_user_name',
        }] : []),
        {
            title: 'Campaign id',
            dataIndex: 'camp_id',
            key: 'camp_id',
        },
        {
            title: 'Campaign Name',
            dataIndex: 'camp_name',
            key: 'camp_name',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                switch (status) {
                    case 'active':
                        return 'Active'
                    case 'pending':
                        return 'Pending'
                    case 'paused':
                        return 'Paused'
                    case 'unpaid':
                        return 'Unpaid'
                    case 'done':
                        return 'Done'
                    default:
                        return ''
                }
            },
        },
        {
            title: 'Platform',
            key: 'platform',
            render: (text, record) => {
                const { slot_ids: slotIds } = record
                const platformMap = record.platform_types;
                // console.log(slotIds)
                // console.log(slotMap)
                // slotIds.forEach((slotId) => {
                //     const slot = slotMap[slotId]
                //     if (slot && !platformMap[slot.platform]) {
                //         platformMap[slot.platform] = true
                //     }
                // })

                return platformMap.map(platform => platformToString(platform)).join(', ')
            },
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
            render: country => (country || []).join(', ') || 'All',
        },
        {
            title: 'Payment Method',
            dataIndex: 'payment_method',
            key: 'payment_method',
        },
        {
            title: 'Start Time',
            key: 'startTime',
            render: (text, record) => {
                const format = 'YYYY-MM-DD HH:mm'
                return `${moment.utc(record.startTime*1000).local().format(format)}`
            },
        },
        {
            title: 'End Time',
            key: 'endTime',
            render: (text, record) => {
                const format = 'YYYY-MM-DD HH:mm'
                return `${moment.utc(record.endTime*1000).local().format(format)}`
            },
        },
        {
            title: 'Operations',
            key: 'operation',
            width: 100,
            render: (text, record) => {
                const { status } = record
                let menuOptions = []
                if (status === 'paused') {
                    menuOptions.push({
                        key: '4',
                        name: 'Activate',
                    })
                    menuOptions.push({
                        key: '1',
                        name: 'Edit',
                    })
                    menuOptions.push({
                        key: '11',
                        name: 'Delete',
                    })
                } else if (status === 'active') {
                    menuOptions.push({
                        key: '5',
                        name: 'Pause',
                    })
                    menuOptions.push({
                        key: '1',
                        name: 'Edit',
                    })
                } else if (status === 'pending') {
                    menuOptions.push({
                        key: '1',
                        name: 'Edit',
                    })
                } else if (status === 'done'){
                    menuOptions.push({
                        key: '11',
                        name: 'Delete',
                    })
                } else if (status === 'unpaid'){
                    menuOptions.push({
                        key: '10',
                        name: 'Edit',
                    })
                    menuOptions.push({
                        key: '11',
                        name: 'Delete',
                    })
                }
                menuOptions = [
                    ...menuOptions,
                    {
                        key: '6',
                        isDivider: true,
                    }
                ]
                return (
                    <DropOption
                        onMenuClick={e => handleMenuClick(record, e)}
                        menuOptions={menuOptions}
                    />
                )
            },
        },
    ]

    const getBodyWrapperProps = {
        page: location.query.page,
        current: tableProps.pagination.current,
    }

    const getBodyWrapper = (body) => { return isMotion ? <AnimTableBody {...getBodyWrapperProps} body={body} /> : body }

    return (
        <div>
            <Table
                {...tableProps}
                className={cn({ [styles.table]: true, [styles.motion]: isMotion })}
                bordered
                // scroll={{ x: 1250 }}
                columns={columns}
                simple
                rowKey={record => record.camp_id}
                getBodyWrapper={getBodyWrapper}
            />
        </div>
    )
}

List.propTypes = {
    isAdmin: PropTypes.bool,
    onDuplicateItem: PropTypes.func,
    onDeleteItem: PropTypes.func,
    onEditItem: PropTypes.func,
    onChangeStatus: PropTypes.func,
    isMotion: PropTypes.bool,
    location: PropTypes.object,
    slotList: PropTypes.array,
}

export default List
