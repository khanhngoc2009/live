import * as React from 'react';
import { Button, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouterName } from './router_name';
import { LoginLayout, RegisterLayout } from '@screen/AuthScreen'

const AuthStack = createStackNavigator();

const AuthStackScreen = () => {
    return (
        <AuthStack.Navigator
        screenOptions={{
            headerShown: false
          }}>
            <AuthStack.Screen name={RouterName.Login_Screen} component={LoginLayout} />
            <AuthStack.Screen name={RouterName.Register_Screen} component={RegisterLayout} />
        </AuthStack.Navigator>
    );
}
export default AuthStackScreen
