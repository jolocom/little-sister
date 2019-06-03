

import * as React from 'react'
import { Animated } from 'react-native'

import { BottomNavBar } from './bottomNavBar'
import { TabBarBottomProps } from 'react-navigation';

const OFFSET = -80

export class SlidingTabBar extends React.Component<TabBarBottomProps, any> {

    componentWillReceiveProps(props: TabBarBottomProps) {
        //
        console.log(props.navigation.getParam('Claims'))
    }

    render() {
        return (
                <Animated.View>
                <BottomNavBar {...this.props}/>
                </Animated.View>
        );
    }
}
