import React from 'react'
import PropTypes from 'prop-types'
// import classnames from 'classnames'
import { color } from 'utils'
import { Menu, Dropdown, Icon, Row, Col } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,AreaChart,Area, BarChart, Bar} from 'recharts'
import styles from './sales.less'
// import { DropOption } from 'components'
// import { SalesMenu } from 'components'


function Sales ( {data} ) {

    return (
        
        <div className={styles.sales}>
        {/* <SalesMenu className={styles.salesMenu}
                    onMenuClick={e => handleMenuClick(e)}
                    menuOptions={menuOptions}
                    menuSelect = {data.menuSelect}
            /> */}
            
            <Row>
            <Col sm={24} md={12}>
            <div className={styles.title}>Click</div>
            <ResponsiveContainer minHeight={360} style={{marginTop:'160px'}}>
                <AreaChart syncId="anyId" data={data.sales.click} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <XAxis dataKey="date" interval={"preserveStart"} axisLine={{ stroke: color.borderBase, strokeWidth: 1 }} tickLine={false} />
                    <YAxis axisLine={false} unit="%" tickLine={false} />
                    <CartesianGrid vertical={false} stroke={color.borderBase} strokeDasharray="3 3" />
                    <Tooltip
                        wrapperStyle={{ border: 'none', boxShadow: '4px 4px 40px rgba(0, 0, 0, 0.05)' }}
                        content={(content) => {
                            const list = content.payload.map((item, key) => <li key={key} className={styles.tipitem}><span className={styles.radiusdot} style={{ background: item.color }} />{`${item.name}:${item.value}`}</li>)
                            return <div className={styles.tooltip}><p className={styles.tiptitle}>{content.label}</p><ul>{list}</ul></div>
                        }}
                    />
                    <Area type="monotone" dataKey="value" fill={color.blue} stroke={color.blue} strokeWidth={3} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                </AreaChart>
            </ResponsiveContainer>
            </Col>
            <Col sm={24} md={12}>
            <div className={styles.title}>Click Rate</div>
            <ResponsiveContainer minHeight={360} style={{marginTop:'160px'}}>
                <BarChart syncId="anyId" data={data.sales.cr}>
                    <XAxis dataKey="date" axisLine={{ stroke: color.borderBase, strokeWidth: 1 }} tickLine={false} />
                    <YAxis axisLine={false} unit="%" tickLine={false} allowDataOverflow={true}/>
                    <CartesianGrid vertical={false} stroke={color.borderBase} strokeDasharray="3 3" />
                    <Tooltip
                        wrapperStyle={{ border: 'none', boxShadow: '4px 4px 40px rgba(0, 0, 0, 0.05)' }}
                        content={(content) => {
                            const list = content.payload.map((item, key) => <li key={key} className={styles.tipitem}><span className={styles.radiusdot} style={{ background: item.color }} />{`${item.name}:${item.value}`}</li>)
                            return <div className={styles.tooltip}><p className={styles.tiptitle}>{content.label}</p><ul>{list}</ul></div>
                        }}
                    />
                    <Bar type="monotone" dataKey="value" maxBarSize = {60}fill={color.green} unit={'%'} stroke={color.green} strokeWidth={3} dot={{ fill: color.green }} activeDot={{ r: 5, strokeWidth: 0 }} />
                </BarChart>
            </ResponsiveContainer>
            </Col>
            </Row>
            
            
        </div>
    )
    // return (
        
    //     <div className={styles.sales}>
    //         <SalesMenu className={styles.salesMenu}
    //                 menuOptions={menuOptions}
    //                 // menuOptions={[{ key: '1', name: 'Edit' }, { key: '3', name: 'Duplicate' }, { key: '2', name: 'Delete' }]}
    //         />
    //         <ReactEcharts
    //             style={{ height: 350 }}
    //             notMerge={true}
    //             lazyUpdate={true}
    //             option={optionDATA} />
            
    //     </div>
    // )
}


Sales.propTypes = {
    data: PropTypes.object,
}

export default Sales
