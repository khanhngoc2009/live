import React, { useState, useRef } from 'react'
import { View, Text, TextInput, Platform, ScrollView, ActivityIndicator, Button, FlatList } from 'react-native'
import { useAppDispatch, useAppSelector } from '../../../store'
import { requestSentryThunk } from '../slice/ListSentrySlice'
import styled from 'styled-components/native'
import { SentryLayout } from '../../../components'
import { setInterval } from 'timers/promises'
import { Sentry } from '../slice/initState'
import GoBack from '../../../components/back'
import { replaceSpecialCharacter } from '../../../util'
import { RouterName } from '../../../navigation/router_name'
import { change_detail } from '../slice/ListSentrySlice'
import { Icon_Image } from '../../../../assets/image'
interface State {
    listSentry?: Sentry[]
}
const ListGensentry = ({ navigation }, props: State) => {
    const refTimeout = useRef<any>(null)
    const appDispatch = useAppDispatch()
    const mySentryReducer = useAppSelector(state => state.mySentryReducer)
    const [page, setPage] = React.useState(1)
    const [valueFind, setValueFind] = React.useState("");
    const [data, setData] = React.useState(props.listSentry);
    const [filterData, setFilterData] = React.useState(props.listSentry)
    const [filter, setFilter] = React.useState(false)
    const getListMyProduct = () => {
        appDispatch(requestSentryThunk(page))
    }
    const setValue = () => {
        if (!filter) { setFilterData(mySentryReducer.data); }
        setData(mySentryReducer.data);
    }
    React.useEffect(() => {
        getListMyProduct()
        setValue()
    }, [page])

    const handedSearch = (text: any) => {
        if (text) {
            setFilter(true);
            if (refTimeout.current != null) clearTimeout(refTimeout.current)
            refTimeout.current = setTimeout(() => {
                const newData = data?.filter((item: Sentry) => {
                    const { name } = item
                    const itemData = name
                        ? replaceSpecialCharacter(name).toUpperCase()
                        : ''.toUpperCase()
                    const textData = replaceSpecialCharacter(text).toUpperCase()
                    return itemData.indexOf(textData) > -1
                })
                setFilterData(newData)
            }, 150)
        } else {
            setFilterData(data)
            setFilter(false)
        }
    }
    const onLoadMore = () => {
        setPage(page + 1)
    }
    const _onSearch = () => {
        setValueFind("");
        setFilter(false);
        setFilterData(data)
    }
    return (
        <>
            {mySentryReducer.error ? <View
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1
                }}
            ><Text
                style={{
                    color: "red",
                    fontSize: 20,
                    fontWeight: "bold"
                }}>Error</Text></View> :
                <View style={{
                    marginVertical: Platform.OS === "android" ? 0 : 30,
                    paddingVertical: Platform.OS === "android" ? 0 : 10,
                }}>
                    <GoBack
                        title="List Sentry Screen"
                        onClickIcon={() => {
                            navigation.goBack()
                        }}
                    />
                    <View style={{
                        marginLeft: 10,
                        justifyContent: "space-around", marginTop: 10, flexDirection: "row", alignItems: "center"
                    }}>
                        <Text style={{ margin: 10, fontWeight: 'bold', fontSize: 15 }}>
                            List Sentries
                        </Text>
                        <View style={{
                            justifyContent: "space-evenly",
                            flexDirection: "row",
                            alignItems: "center",
                            borderColor: "gray",
                            borderWidth: 0.5,
                            borderRadius: 8,
                            paddingHorizontal: 5
                        }} >
                            <TextInput
                                value={valueFind}
                                onChangeText={(text) => {
                                    setValueFind(text)
                                    handedSearch(text);
                                }}
                                placeholder={`name`}
                                style={{
                                    width: 150,
                                    height: 30,
                                    padding: 5, fontSize: 13
                                }}
                            />
                            {filter && <Button_X_Icon_Search onPress={_onSearch}>
                                <Image_X_Icon_Search
                                    source={Icon_Image.x_ic}
                                />
                            </Button_X_Icon_Search>}
                        </View>
                    </View>
                    {mySentryReducer?.isLoading && !mySentryReducer.isLoadMore ?
                        <View style={{ backgroundColor: "transparent", alignItems: 'center', marginTop: 600 }}>
                            <ActivityIndicator color="red" />
                        </View> : <FlatList
                            data={!filter ? mySentryReducer.data : filterData || []}
                            renderItem={({ item, index }) => (
                                <SentryLayout key={`${index}`}
                                    item={item}
                                    onClick={() => {
                                        appDispatch(change_detail(item))
                                        navigation.navigate(RouterName.SentryDetailScreen);
                                    }}
                                />
                            )}
                            showsVerticalScrollIndicator={false}
                            refreshing={false}
                            onRefresh={() =>
                                setPage(1)
                            }
                            keyExtractor={item => `${item.id}`}
                            onEndReached={onLoadMore}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={mySentryReducer.isLoadMore ? <ActivityIndicator color="red" /> : null}
                        />}
                </View>
            }
        </>
    )
}
export default ListGensentry


const Image_X_Icon_Search = styled.Image`
width:15px;
height:15px
`
const Button_X_Icon_Search = styled.TouchableOpacity`
justifyContent:center;
alignItems:center;
`
