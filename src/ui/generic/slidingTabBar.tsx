

import * as React from 'react'
import { Animated } from 'react-native'

import { BottomNavBar } from './index'
import { TabBarBottomProps } from 'react-navigation';

const OFFSET = -80

export class SlidingTabBar extends React.Component<TabBarBottomProps, {offsetY: Animated.Value}> {
    constructor(props: TabBarBottomProps) {
        super(props)
        this.state = {
            offsetY: new Animated.Value(0)
        }
    }

    componentWillReceiveProps(props: TabBarBottomProps) {
        const oldState = this.props.navigation.state;
        const oldRoute = oldState.routes[oldState.index];
        const oldParams = oldRoute.params;
        const wasVisible = !oldParams || oldParams.visible;

        const newState = props.navigation.state;
        const newRoute = newState.routes[newState.index];
        const newParams = newRoute.params;
        const isVisible = !newParams || newParams.visible;

        if (wasVisible && !isVisible) {
            Animated.timing(this.state.offsetY, { toValue: OFFSET, duration: 200 }).start();
        } else if (isVisible && !wasVisible) {
            Animated.timing(this.state.offsetY, { toValue: 0, duration: 200 }).start();
        }
    }

    render() {
        return (
                <Animated.View style={{ bottom: this.state.offsetY }}>
                <BottomNavBar {...this.props}/>
                </Animated.View>
        );
    }
}
