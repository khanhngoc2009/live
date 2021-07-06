import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RouterName } from './router_name';
import { useAppSelector } from '../store';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NavigationHome from './NavigationHome'
import NavigationSentry from './NavigationSentry'
import NavigationAuth from "./NavigationAuth"
import { Tab_Name_Route } from './tab_name'
import { Icon_Image } from '@assets/image';
import { Image } from 'react-native';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Navigation = () => {
    const loginUserReducer = useAppSelector(state => state.loginUserReducer)
    return (
        <NavigationContainer>
            {loginUserReducer.isLogin ?
                <Stack.Navigator screenOptions={{
                    headerShown: false
                }} initialRouteName={RouterName.Login_Screen}>
                    <Stack.Screen name={RouterName.Login_Screen} component={NavigationAuth} />
                </Stack.Navigator>
                :
                <Tab.Navigator>
                    <Tab.Screen
                        options={{
                            tabBarIcon: () => (
                              <Image style={{width:15,height:15}}
                               source={Icon_Image.home_ic}/>
                            ),
                          }}
                    name={Tab_Name_Route.Home} component={NavigationHome} />
                    <Tab.Screen options={{
                            tabBarIcon: () => (
                              <Image style={{width:20,height:20}}
                               source={Icon_Image.sentry_ic}/>
                            ),
                          }} name={Tab_Name_Route.Sentry} component={NavigationSentry} />
                </Tab.Navigator>}
        </NavigationContainer>
    );
}
export default Navigation