import React from 'react';
import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import { RouterName } from './router_name';
import { HomePageLayout } from '@screen/HomeScreen'
import { ProfileLayout, SettingScreen } from '@screen/SettingScreen'
import { useAppSelector } from '../store';
import { LiveScreenLayout as LiveScreen, LiveRoomLayout as LiveRoomScreen, LiveSendMessage } from '@screen/LiveScreen';
import ListGensentry from '@screen/GetsentryScreen/layout/ListSentry';
import { ListUserLayout } from '@screen/UserScreen'
import SentryDetailScreen from '@screen/GetsentryScreen/layout/SentryDetailScreen'
import CreateUserScreen from '@screen/UserScreen/layout/CreateUserLayout'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {NotificationScreen} from '@screen/Notification'
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const NavigationHome = () => {
  return (
    <>
        <Stack.Navigator screenOptions={{
          headerShown: false
        }} initialRouteName={RouterName.Home_Screen}>
          <Stack.Screen name={RouterName.Home_Screen} component={HomePageLayout} />
          <Stack.Screen name={RouterName.UpdateInfo_Screen} component={ProfileLayout} />
          <Stack.Screen name={RouterName.LiveScreen} component={LiveScreen} />
          <Stack.Screen name={RouterName.LiveRoomScreen} component={LiveRoomScreen} />
          <Stack.Screen name={RouterName.LiveSendMessage} component={LiveSendMessage} />
          <Stack.Screen name={RouterName.ListSentryScreen} component={ListGensentry} />
          <Stack.Screen name={RouterName.ListUserScreen} component={ListUserLayout} />
          <Stack.Screen name={RouterName.SentryDetailScreen} component={SentryDetailScreen} />
          <Stack.Screen name={RouterName.CreateUserScreen} component={CreateUserScreen} />
          <Stack.Screen name={RouterName.SettingScreen} component={SettingScreen} />
          <Stack.Screen name={RouterName.NotificationScreen} component={NotificationScreen} />
        </Stack.Navigator>
    </>
  );
}
export default NavigationHome