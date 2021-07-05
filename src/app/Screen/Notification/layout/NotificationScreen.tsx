import { GoBackLayout } from "@app/components";
import React, { useRef, useState } from "react";
import { Platform, FlatList, View, ActivityIndicator, Text } from "react-native";
import { useAppDispatch, useAppSelector } from '../../../store'
import { requestNotificationThunk } from "@app/store/notification/NotificationSlice";
const NotificationScreen = ({ navigation }) => {
    const appDispatch = useAppDispatch()
    const myNotification = useAppSelector(state => state.NotificationReducer)
    const getListMyProduct = () => {
        appDispatch(requestNotificationThunk())
    }
    React.useEffect(() => {
        getListMyProduct()
    }, [])
    return (
        <View style={{
            paddingVertical: Platform.OS === "ios" ? 40 : 0,
            flex: 1
        }}>
            <GoBackLayout
                title="Notification"
                onClickIcon={() => {
                    navigation.goBack()
            }}/>
            {myNotification.isLoading && !myNotification.isLoadMore ? <View style={{ backgroundColor: "transparent", alignItems: 'center', marginTop: 500 }}>
                <ActivityIndicator color="red" />
            </View> : <FlatList
                data={myNotification.data || []}
                renderItem={({ item, index }) => (
                    <View style={{ padding: 10, margin: 5, borderColor: "gray", borderRadius: 5, borderWidth: 0.3 }}>
                        <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.title}</Text>
                        <Text style={{ fontSize: 13 }}>{item.description}</Text>
                        <Text style={{ fontStyle: "italic", fontSize: 13 }}>{item.by}</Text>
                    </View>
                )}
                showsVerticalScrollIndicator={false}
                refreshing={false}
                onRefresh={() => { }
                }
                keyExtractor={item => `${item.id}`}
                onEndReached={() => { }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={myNotification.isLoadMore ? <ActivityIndicator color="red" /> : null}
            />}

        </View>
    )
}
export default NotificationScreen