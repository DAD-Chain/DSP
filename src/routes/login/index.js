import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, Row, Form, Input,Layout} from 'antd'
import { config } from 'utils'
import styles from './index.less'
import { Modal } from 'antd'
import SignupModal from './SignupModal'

const { Header, Footer, Sider, Content } = Layout;
const { api } = config
const { walletDownloadAddr } = api

const FormItem = Form.Item

const Login = ({
    loading,
    login,
    dispatch,
    form: {
        getFieldDecorator,
        validateFieldsAndScroll,
    },
}) => {
    function handleOk () {
        const values = {
            username: 'admin',
            password: 12345,
        }
        validateFieldsAndScroll((errors) => {
            if (errors) {
                return
            }
            dispatch({ type: 'login/login', payload: values })
        })
    }

    function handleSignup () {
        console.log('on tap signup')
        dispatch({
            type: 'login/openSignupModel',
        })
    }

    function handleDownloadCancel(){
        dispatch({
            type: 'login/closeDownloadModel',
        })
    }

    function handleModelOk(){
        dispatch({
            type: 'login/closeWarningModel',
        })
    }

    function handleDownloadOk(){
        window.open(walletDownloadAddr, '_blank');
        dispatch({
            type: 'login/closeDownloadModel',
        })
    }

    const getFooter = () => {
        return(
            <div>
                <Button type="ghost" size="large" onClick={handleDownloadCancel}>Cancel</Button>
                <Button type="primary" size="large" onClick={handleDownloadOk}>Download</Button>
            </div>
        )
    }

    const getWarningFooter = () => {
        return(
            <div>
                <Button type="primary" size="large" onClick={handleModelOk}>OK</Button>
            </div>
        )
    }


    const signupModalProps = {
        login,
        visible: login.showSignupModel,
        maskClosable: false,
        confirmLoading: loading.effects['applicationSlots/update'],
        title: 'Apply for an account',
        wrapClassName: 'vertical-center-modal',
        okText: 'OK',
        cancelText: 'Cancel',
        onOk (data) {
            console.log('on tap sigup modal ok button')

            console.log('on apply accoubnt', data)
            dispatch({ type: 'login/signup', payload: data })
        },
        onCancel () {
            console.log('on tap sigup modal cancel button')
            dispatch({
                type: 'login/closeSignupModel',
            })
        },
    }

    return (

        <Layout className={styles.layout}>
            <Header className={styles.topHeader}>
                <div className={styles.headerLogo}></div>
                <div className={[styles.headerButtonSignIn]} onClick={handleOk}>
                    <p>Access your account</p>
                </div>

                <div className={styles.headerButton} onClick={handleSignup}>
                    <p>Apply your account</p>
                </div>
            </Header>
            <Content>
                <div className={styles.middleContent}>
                    <div className={styles.content}><div>
                    <div className={styles.title}></div>
                    <p>Infrastructure To Connect Global Advertising</p>
                    <div className={styles.middleButton} onClick={handleOk}>
                        <p>Access your account </p>
                        <div className={styles.arrow}></div>
                    </div>
                    </div>
                    <div className={styles.rightBG}></div>
                    </div>
                </div>
            </Content>
            <Modal
                title="Tips"
                closable={false}
                visible={login.showDonwloadModel}
                footer = {getFooter()}
            >
                <p>Please install DAD wallet extension, and log in with DAD wallet, after that please do this operation again.</p>
            </Modal>
            <Modal
                title="Tips"
                closable={false}
                visible={login.showWarningModel}
                footer = {getWarningFooter()}
            >
                <p>{login.warningModelText}</p>
            </Modal>

            <SignupModal {...signupModalProps} />
        </Layout>




        /*<div className={styles.form}>
            <div className={styles.logo}>
                <img alt={'logo'} src={config.logo} />
                <span>{config.name}</span>
            </div>
            <form>
                <FormItem hasFeedback>
                    {getFieldDecorator('username', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input username',
                            },
                        ],
                    })(<Input size="large" onPressEnter={handleOk} placeholder="Username" />)}
                </FormItem>
                <FormItem hasFeedback>
                    {getFieldDecorator('password', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input password',
                            },
                        ],
                    })(<Input size="large" type="password" onPressEnter={handleOk} placeholder="Password" />)}
                </FormItem>
                <Row>
                    <Button type="primary" size="large" onClick={handleOk} loading={loading.effects.login}>
                        Login
                    </Button>
                </Row>

            </form>
        </div>*/
    )
}

Login.propTypes = {
    form: PropTypes.object,
    dispatch: PropTypes.func,
    loading: PropTypes.object,
    login: PropTypes.object,
}

export default connect(({ login, loading }) => ({ login, loading }))(Form.create()(Login))
