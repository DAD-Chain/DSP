/**
 * SignupModal
 *
 * @author zbx
 */
import React from 'react'
import PropTypes from 'prop-types'
import {
    Form, Input, InputNumber, Modal, Select, Radio,
} from 'antd'


const FormItem = Form.Item
const Option = Select.Option
const RadioButton = Radio.Button

const formItemLayout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 14,
    },
}

const modal = (
    {
        login,
        item = {},
        onOk,
        form: {
            getFieldDecorator,
            validateFields,
            getFieldsValue,
        },
        modalType,
        ...modalProps
    }
) => {

    console.log('signup modal', modalProps)
    const handleOk = () => {
        validateFields((errors) => {
            if (errors) {
                return
            }
            const data = {
                ...getFieldsValue(),
                // key: item.key,
                // slot_id: item.slot_id,
                // app_id: application.app_id,
            }

                    // const values = {
        //     company_address: 'high tec, c',
        //     company_name: 'tap4fun',
        //     contact_person_name: 'zbx',
        //     contract_email: 'zbx@test.com',
        //     phone_num: '1234567890',
        //     role: 'PUBLISHER'
        // }

            console.log('signupmodal ok',data)
            onOk(data)
        })
    }

    const modalOpts = {
        ...modalProps,
        onOk: handleOk,
    }

    const validatePhoneNumber = (rule, value, callback)=>{
        if(/^[0-9]*$/.test(value) == false){
            callback('Please input correct phone number')
        }else{
            callback()
        }
    }

    return (
        <Modal width={760} {...modalOpts}>
            <Form layout="horizontal">
                <FormItem label="Company Name" hasFeedback {...formItemLayout}>
                    {getFieldDecorator('company_name', {
                        initialValue: item.slot_name,
                        rules: [
                            {
                                required: true,
                                message: 'Please input company name',
                            },
                        ],
                    })(<Input />)}
                </FormItem>

                <FormItem label=" Company Address" hasFeedback {...formItemLayout}>
                    {getFieldDecorator('company_addr', {
                        initialValue: item.slot_name,
                        rules: [
                            {
                                required: false,
                                message: 'Please input company address',
                            },
                        ],
                    })(<Input />)}
                </FormItem>
                
                <FormItem label="Account Type" hasFeedback {...formItemLayout}>
                        {getFieldDecorator('role', {
                            initialValue: item.account_type || 'ADVERTISER',
                            rules: [
                                {
                                    required: true,
                                    message: 'Please choose account type',
                                },
                            ],
                        })(
                        <Radio.Group>
                                <Radio value="ADVERTISER">Advertiser</Radio>
                                <Radio value="PUBLISHER">Publisher</Radio>
                        </Radio.Group>
                        )}
                </FormItem>

                <FormItem label="Contact Person Name" hasFeedback {...formItemLayout}>
                    {getFieldDecorator('contact_person_name', {
                        initialValue: item.slot_name,
                        rules: [
                            {
                                required: true,
                                message: 'Please input company person name',
                            },
                        ],
                    })(<Input />)}
                </FormItem>

                <FormItem label="Phone Number"  hasFeedback {...formItemLayout}>
                    {getFieldDecorator('phone_num', {
                        initialValue: item.slot_name,
                        rules: [
                            {
                                required: true,
                                message: 'Please input phone number',
                            },
                            {
                                validator: validatePhoneNumber
                            }
                        ],
                    })(<Input />)}
                </FormItem>

                <FormItem label="Email" hasFeedback {...formItemLayout}>
                    {getFieldDecorator('contract_email', {
                        initialValue: item.slot_name,
                        rules: [
                            {
                                required: true,
                                message: 'Please input email',
                            },
                            {
                                type: "email",
                                message: "Please input correct email"
                            },
                        ],
                    })(<Input />)}
                </FormItem>
            </Form>
        </Modal>
    )
}

modal.propTypes = {
    application: PropTypes.object,
    form: PropTypes.object.isRequired,
    type: PropTypes.string,
    modalType: PropTypes.string,
    item: PropTypes.object,
    onOk: PropTypes.func,
}

export default Form.create()(modal)
