import React from 'react'
import PropTypes from 'prop-types'
import { FilterItem } from 'components'
import { Form, Button, Row, Col, DatePicker, Radio, Input, Select } from 'antd'
import { getDifferTime, getCurrentTime } from 'utils'

const Search = Input.Search
const Option = Select.Option
const RadioButton = Radio.Button
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
    onSearch,
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

    const handleShortCut = (e) => {
        switch(e.target.value){
            case 'ytd':
            onFilterChange({
                start_time:getDifferTime(1),
                end_time:getCurrentTime()
            })
            break;
            case '3d':
            onFilterChange({
                start_time:getDifferTime(2),
                end_time:getCurrentTime()
            })
            break;
            case '7d':
            onFilterChange({
                start_time:getDifferTime(6),
                end_time:getCurrentTime()
            })
            break;
            case '1m':
            onFilterChange({
                start_time:getDifferTime(29),
                end_time:getCurrentTime()
            })
            break;
        }
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

    const { camp_id, camp_name, status, start_time, end_time, adv_id } = filter

    return (
        <div>
        <Row gutter={24}>
            <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }} sm={{ span: 12 }}>
                <FilterItem label="Start Date">
                    {getFieldDecorator('start_time', { initialValue: start_time })(
                        <DatePicker style={{ width: '100%' }}
                            size="large"
                            // onChange={handleChangeDate.bind(null, 'start_time')}
                        />,
                    )}
                </FilterItem>
            </Col>
            <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }} sm={{ span: 12 }}>
                <FilterItem label="End Date">
                    {getFieldDecorator('end_time', { initialValue: end_time })(
                        <DatePicker style={{ width: '100%' }}
                            size="large"
                            // onChange={handleChangeDate.bind(null, 'end_time')}
                        />,
                    )}
                </FilterItem>
            </Col>
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
                </div>
            </Col>
        </Row>
        <Row gutter={24} style={{marginBottom:'16px'}}>
            <Radio.Group onChange={handleShortCut}>
                <RadioButton value="ytd">YTD</RadioButton>
                <RadioButton value="3d">3D</RadioButton>
                <RadioButton value="7d">7D</RadioButton>
                <RadioButton value="1m">1M</RadioButton>
            </Radio.Group>
        </Row>
        </div>
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
