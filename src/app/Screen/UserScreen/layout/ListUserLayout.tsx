import React, { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, Platform, TextInput } from 'react-native'
import GoBack from "@components/back";
import axios from "axios";
import { ApiURL } from "@network/api";
import styled from 'styled-components/native'
import { replaceSpecialCharacter } from '@util/index'
import { Sentry } from "@screen/GetsentryScreen/slice/initState";
import { Icon_Image } from "@assets/image";
import { RouterName } from "@navigation/router_name";

const ListUserLayout = ({ navigation }) => {
    const refTimeout = useRef<any>(null)
    const [data, setData] = useState([]);
    const [filterData, setFilterData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [valueFind, setValueFind] = useState("");
    const [page, setPage] = useState(1)
    const [filter, setFilter] = useState(false)
    const getListUser = async () => {
        setIsLoading(true);
        await axios.get(ApiURL.User).then((res) => {
            if (res.status === 200) {
                setData(res.data);
                setFilterData(res.data);
                setIsLoading(false);
            }
        }).catch((e) => {
            setIsLoading(false);
        })
    }
    useEffect(() => {
        getListUser();
    },[])
    const handedSearch = (text: any) => {
        if (text) {
            setFilter(true)
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
            setFilter(false)
            setFilterData(data)
        }
    }
    const onLoadMore = () => {

    }
    const _listEmptyComponent = () => (
        <View style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            marginTop: 100
        }}>
            <Text style={{
                color: "red",
                fontWeight: "bold",
            }}>
                is null
            </Text>
        </View>
    )
    return (
        <View >

            <View style={{
                marginVertical: Platform.OS === "android" ? 0 : 30,
                paddingVertical: Platform.OS === "android" ? 0 : 10,
            }}>
                <GoBack
                    title="List User Screen"
                    onClickIcon={() => {
                        navigation.goBack()
                    }}
                />
                <View style={{
                    marginLeft: 10,
                    justifyContent: "space-around", marginTop: 10, flexDirection: "row", alignItems: "center"
                }}>
                    <Text style={{
                        margin: 10,
                        fontWeight: 'bold',
                        fontSize: 15
                    }}>
                        List User
                    </Text>
                    <View style={{
                        justifyContent: "space-evenly",
                        flexDirection: "row",
                        alignItems: "center",
                        borderColor: "gray",
                        borderWidth: 0.5,
                        borderRadius: 8,
                        paddingHorizontal: 5,
                    }} >
                        <TextInput
                            value={valueFind}
                            onChangeText={(text) => {
                                setValueFind(text)
                                handedSearch(text);
                            }}
                            placeholder={`name`}
                            style={{
                                width: 200,
                                height: 30,
                                padding: 5, fontSize: 13
                            }}
                        />
                        {filter && <Button_X_Icon_Search onPress={() => {
                            setValueFind("");
                            setFilter(false);
                            setFilterData(data)
                        }}>
                            <Image_X_Icon_Search
                                source={Icon_Image.x_ic}
                            />
                        </Button_X_Icon_Search>}
                    </View>
                    <Button_X_Icon_Search
                    onPress={()=>{
                        navigation.navigate(RouterName.CreateUserScreen)
                    }}
                    >
                        <Image_X_Icon_Search
                            source={Icon_Image.edit_ic}
                        />
                    </Button_X_Icon_Search>
                </View>
                <View>
                    <FlatList
                        data={filterData || []}
                        renderItem={({ item, index }) => (
                            <View style={{
                                padding: 40,
                                borderRadius: 10,
                                justifyContent: "space-evenly",
                                alignItems: "center",
                                flexDirection: "row",
                                borderColor: "gray",
                                borderWidth: 0.5,
                                margin: 7,
                            }}>
                                <Text>{item.name}</Text>
                                <Text>{item.email}</Text>
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                        refreshing={false}
                        onRefresh={() =>
                            setPage(1)
                        }
                        ListEmptyComponent={_listEmptyComponent}
                        keyExtractor={item => `${item.id}`}
                        onEndReached={onLoadMore}
                        onEndReachedThreshold={0.5}
                    />
                </View>
            </View>
        </View>
    )
}
export default ListUserLayout

const Image_X_Icon_Search = styled.Image`
width:15px;
height:15px
`
const Button_X_Icon_Search = styled.TouchableOpacity`
justifyContent:center;
alignItems:center;
`