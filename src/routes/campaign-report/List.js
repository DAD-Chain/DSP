import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'antd'
import classnames from 'classnames'
import queryString from 'query-string'
import moment from 'moment/moment'
import AnimTableBody from 'components/DataTable/AnimTableBody'
import styles from './List.less'
import { toString as platformToString } from '../../constants/PLATFORM'

/* eslint-disable camelcase */

const List = ({ isMotion, location, ...tableProps }) => {
    location.query = queryString.parse(location.search)

    const columns = [
        
        {
            title: 'Campaign Id',
            key: 'camp_id',
            dataIndex: 'camp_id',
        },
        {
            title: 'Campaign Name',
            key: 'camp_name',
            dataIndex: 'camp_name',
        },
        {
            title: 'Platforms',
            dataIndex: 'platforms',
            key: 'platforms',
            render: platforms => (platforms || []).map(platform => platformToString(platform)).join(', '),
        },
        {
            title: 'Impression',
            dataIndex: 'impressions',
            key: 'impressions',
        },
        {
            title: 'Clicks',
            key: 'clicks',
            dataIndex: 'clicks',
        },
        {
            title: 'CTR',
            key: 'ctr',
            dataIndex: 'ctr',
            render: ctr => `${ctr} %`,
        },
        {
            title: 'Date',
            key: 'date',
            dataIndex: 'date',
            render: (date) => {
                const format = 'YYYY-MM-DD'
                return `${moment.utc(date).format(format)}`
            },
        },
        {
            title: 'Advertising Spent',
            key: 'spent',
            dataIndex: 'spent',
            render: spent => `${spent} DAD`,
        },
        {
            title: 'Transaction record',
            key: 'adv_account',
            dataIndex: 'adv_account',
            render: adv_account => <a href={'https://explorer.dad.one/test/pages/address_en.html?'+adv_account} target="_blank">{adv_account}</a>,
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
                className={classnames({ [styles.table]: true, [styles.motion]: isMotion })}
                bordered
                // scroll={{ x: 1250 }}
                columns={columns}
                simple
                rowKey={record => (`${record.camp_id}_${record.platform}_${record.date}`)}
                getBodyWrapper={getBodyWrapper}
            />
        </div>
    )
}

List.propTypes = {
    isMotion: PropTypes.bool,
    location: PropTypes.object,
}

export default List
