

import * as React from 'react'
import { Animated } from 'react-native'

import { BottomNavBar } from './bottomNavBar'
import { TabBarBottomProps } from 'react-navigation';

const OFFSET = -80

export class SlidingTabBar extends React.Component<TabBarBottomProps, any> {
    constructor(props: TabBarBottomProps) {
        super(props)
        const scrollAnim = new Animated.Value(0)
        this.state = {
            scrollAnim,
            offsetY: Animated.diffClamp(0, 0, 0)
        }
    }

    componentWillReceiveProps(props: TabBarBottomProps) {

    }

    render() {
        return (
                <Animated.View style={{ transform: [{
                    translateY: this.state.offsetY.interpolate({
                        inputRange: [0, 1],
                        outputRange: [OFFSET, 0]
                    })
                }] }}>
                <BottomNavBar {...this.props}/>
                </Animated.View>
        );
    }
}
