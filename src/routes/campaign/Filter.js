import React from 'react'
import PropTypes from 'prop-types'
import { FilterItem } from 'components'
import { Form, Button, Row, Col, DatePicker, Input, Select } from 'antd'

const Search = Input.Search
const Option = Select.Option

const ColProps = {
    xs: 24,
    sm: 12,
    style: {
        marginBottom: 16,
    },
}

const TwoColProps = {
    ...ColProps,
    xl: 96,
}

const Filter = ({
    isAdmin,
    advList,
    onAdd,
    onFilterChange,
    filter,
    form: {
        getFieldDecorator,
        getFieldsValue,
        setFieldsValue,
    },
}) => {
    const formatDate = (fields) => {
        fields.start_time = fields.start_time ? fields.start_time.format('YYYY-MM-DD') : undefined
        fields.end_time = fields.end_time ? fields.end_time.format('YYYY-MM-DD') : undefined
    }

    const handleSubmit = () => {
        let fields = getFieldsValue()
        formatDate(fields)
        onFilterChange(fields)
    }

    const handleReset = () => {
        const fields = getFieldsValue()
        for (let item in fields) {
            if ({}.hasOwnProperty.call(fields, item)) {
                if (fields[item] instanceof Array) {
                    fields[item] = []
                } else {
                    fields[item] = undefined
                }
            }
        }
        setFieldsValue(fields)
        handleSubmit()
    }

    const handleChangeDate = (key, values) => {
        let fields = getFieldsValue()
        fields[key] = values
        formatDate(fields)
        onFilterChange(fields)
    }

    const handleChangeSelect = (key, values) => {
        let fields = getFieldsValue()
        fields[key] = values
        formatDate(fields)
        onFilterChange(fields)
    }

    var { camp_id, camp_name, status, start_time, end_time, adv_id } = filter
    if(!status){
        status = 'all'
    }

    return (
        <Row gutter={24}>
            <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }}>
                {getFieldDecorator('camp_id', { initialValue: camp_id })(<Search placeholder="Search by campaign id"
                    size="large"
                    onSearch={handleSubmit}
                />)}
            </Col>
            <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }}>
                {getFieldDecorator('camp_name', { initialValue: camp_name })(<Search placeholder="Search by campaign name"
                    size="large"
                    onSearch={handleSubmit}
                />)}
            </Col>
            <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }}>
                <FilterItem label="Status">
                    {
                        getFieldDecorator('status', { initialValue: 'all' || 'all' })(
                        <Select style={{ width: '100%' }} size="large" onChange={handleChangeSelect.bind(null, 'status')}>
                            <Option value="all">All</Option>
                            <Option value="active">Active</Option>
                            <Option value="pending">Pending</Option>
                            <Option value="paused">Paused</Option>
                            <Option value="unpaid">Unpaid</Option>
                            <Option value="done">Done</Option>
                        </Select>
                    )}
                </FilterItem>
            </Col>
            <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }} sm={{ span: 12 }}>
                <FilterItem label="Start Date">
                    {getFieldDecorator('start_time', { initialValue: start_time })(
                        <DatePicker style={{ width: '100%' }}
                            size="large"
                            onChange={handleChangeDate.bind(null, 'start_time')}
                        />,
                    )}
                </FilterItem>
            </Col>
            <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }} sm={{ span: 12 }}>
                <FilterItem label="End Date">
                    {getFieldDecorator('end_time', { initialValue: end_time })(
                        <DatePicker style={{ width: '100%' }}
                            size="large"
                            onChange={handleChangeDate.bind(null, 'end_time')}
                        />,
                    )}
                </FilterItem>
            </Col>
            {/* {
                isAdmin ?
                    <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }} sm={{ span: 12 }}>
                        <FilterItem label="Advertisers">
                            {getFieldDecorator('adv_id', { initialValue: adv_id || 'all' })(
                                <Select style={{ width: '100%' }} size="large" onChange={handleChangeSelect.bind(null, 'adv_id')}>
                                    <Option value="all">All</Option>
                                    {
                                        (advList || []).map(adv => <Option key={adv.adv_id} value={`${adv.adv_id}`}>{adv.adv_name}</Option>)
                                    }
                                </Select>
                            )}
                        </FilterItem>
                    </Col> : null
            } */}
            <Col {...TwoColProps} xl={{ span: 10 }} md={{ span: 24 }} sm={{ span: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div>
                        <Button type="primary"
                            size="large"
                            className="margin-right"
                            onClick={handleSubmit}
                        >Search</Button>
                        <Button size="large" onClick={handleReset}>Reset</Button>
                    </div>
                    <div>
                        <Button size="large" type="ghost" onClick={onAdd}>Create</Button>
                    </div>
                </div>
            </Col>
        </Row>
    )
}

Filter.propTypes = {
    isAdmin: PropTypes.bool,
    advList: PropTypes.array,
    onAdd: PropTypes.func,
    form: PropTypes.object,
    filter: PropTypes.object,
    onFilterChange: PropTypes.func,
}

export default Form.create()(Filter)
