import * as React from 'react';
import { Button, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouterName } from './router_name';
import ListGensentry from '@screen/GetsentryScreen/layout/ListSentry';
import SentryDetailScreen from '@screen/GetsentryScreen/layout/SentryDetailScreen';
const SentryStack = createStackNavigator();
 const SentryStackScreen=() =>{
    return (
        <>
        <SentryStack.Navigator
        screenOptions={{
            headerShown: false
          }}>
            <SentryStack.Screen name={RouterName.Login_Screen} component={ListGensentry} />
            <SentryStack.Screen name={RouterName.Register_Screen} component={SentryDetailScreen} />
        </SentryStack.Navigator>
        </>
    );
}
export default SentryStackScreen
