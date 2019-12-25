import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown, Button, Icon, Menu } from 'antd'

const Divider = () => {
    return <div style={{ borderTop: '1px solid #f4f4f4' }} />
}

const SalesMenu = ({ onMenuClick, menuOptions = [], buttonStyle, dropdownProps, menuSelect }) => {
    const menu = menuOptions.map((item) => {
        if (item.isDivider) {
            return <Divider key={item.key}/>
        }
        return <Menu.Item key={item.key} disabled={!!item.disabled}>{item.name}</Menu.Item>
    })
    const word = menuSelect? menuSelect : 'Click'

    return (<Dropdown
        overlay={<Menu onClick={onMenuClick}>{menu}</Menu>}
        {...dropdownProps}
    >
        <a className="ant-dropdown-link" style={{position:"absolute", marginLeft:'150px', marginTop:'5px'}}  href="#">
        {word} <Icon type="down" />
        </a>

    </Dropdown>)
}

SalesMenu.propTypes = {
    onMenuClick: PropTypes.func,
    menuOptions: PropTypes.array.isRequired,
    buttonStyle: PropTypes.object,
    dropdownProps: PropTypes.object,
}

export default SalesMenu
