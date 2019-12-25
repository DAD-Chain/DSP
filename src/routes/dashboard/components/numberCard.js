import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Card } from 'antd'
import CountUp from 'react-countup'
import styles from './numberCard.less'

function NumberCard ({ icon, color, title, number, countUp }) {
    var unit;
    var decimal;
    switch(title){
        case 'Advertising Spent':
            unit = ' DAD'
            decimal = 2
            break;
        case 'Clicks':
            unit = ''
            decimal = 0
            break;
        case 'Clicks Rate':
            unit = ' %'
            decimal = 2
            break;
        case 'Cost Per Click':
            unit = ' DAD'
            decimal = 2
            break;

    }

    return (
        <Card className={styles.numberCard} bordered={true} bodyStyle={{ padding: 0 }}>
            {/* <Icon className={styles.iconWarp} style={{ color }} type={icon} /> */}
            <div className={styles[icon]}></div>
            <div className={styles.content}>
            <p className={styles.number}>
                    <CountUp
                        start={0}
                        end={number}
                        duration={2.75}
                        decimals={decimal}
                        useEasing
                        useGrouping
                        separator=","
                        {...countUp || {}}
                    /> {unit}
                </p>
                <p className={styles.title}>{title || 'No Title'}</p>
            </div>
        </Card>
    )
}

NumberCard.propTypes = {
    icon: PropTypes.string,
    color: PropTypes.string,
    title: PropTypes.string,
    number: PropTypes.number,
    countUp: PropTypes.object,
}

export default NumberCard
