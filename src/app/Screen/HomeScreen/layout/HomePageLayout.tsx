import React from 'react';
import { View, ImageBackground, Text, Platform, Image, ScrollView } from 'react-native';
import styled from 'styled-components/native';

import { useAppDispatch, useAppSelector } from '@app/store';
import { Icon_Image } from '@assets/image';
import { RouterName } from '@navigation/router_name';
import HeaderHomeLayout from './HeaderHomeLayout';
const HomePageLayout = ({ navigation }) => {
    return (
        <View style={{flex: 1,}}>
            <HeaderHomeLayout navigation={navigation}/>
            <ScrollView style={{ flex: 1, }}>
                <View style={{ justifyContent: "space-evenly" }}>
                    <ButtonLiveStream style={{
                        height: 200,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center"
                    }} onPress={() => { navigation.navigate(RouterName.StartLiveScreen) }}>
                        <ImageStyled
                            source={Icon_Image.live_Image_home_screen}
                            style={{
                                width: "72%",
                                height: 190,
                                borderWidth: 0.3,
                                marginTop: 0,
                                borderColor: "gray"
                            }}
                        />
                        <View style={{ width: "28%" }}>
                            <TextButton style={{ fontSize: 14, margin: 10 }}>Live stream</TextButton>
                            <Text
                                style={{
                                    margin: 10,
                                    fontSize: 10
                                }}>About anythings scare with you now ...</Text>
                        </View>
                    </ButtonLiveStream>
                    <View style={{flexDirection: "row",paddingVertical: 10}}>
                        <ButtonLiveStream style={{
                            width: "45%", height: 420
                        }} onPress={() => {
                            navigation.navigate(RouterName.LiveRoomScreen)
                        }}>
                            <ImageStyled
                                source={Icon_Image.live_room_home_screen}
                                style={{width: "100%",height: 280}}
                            />
                            <View style={{
                                paddingVertical: 30,
                                justifyContent: "center",
                                paddingHorizontal: 5
                            }}>
                                <Text style={{ fontSize: 13 }}>Connecting with your friends, started now ...</Text>
                                <TextButton style={{ fontSize: 23, marginTop: 10 }}>Rooms Live</TextButton>
                            </View>
                        </ButtonLiveStream>
                        <View style={{width:"45%"}}>
                            <ButtonLiveStream style={{ width: "100%", height: 200 }} onPress={() => { navigation.navigate(RouterName.LiveScreen) }}>
                                <ImageStyled
                                    source={Icon_Image.send_live_home_screen}
                                    style={{width: "100%",height: 130}}
                                />
                                <View style={{ padding: 5 }}>
                                    <TextButton style={{ fontSize: 14 }}>Send Messages</TextButton>
                                    <Text style={{ fontSize: 10,marginTop:3}}>Please send loves with your friends ...</Text>
                                </View>
                            </ButtonLiveStream>
                            <ButtonLiveStream style={{ width: "100%", height: 200, marginTop: 20 }} onPress={() => { navigation.navigate(RouterName.ListUserScreen) }}>
                                <ImageStyled
                                    source={Icon_Image.friends_image_home_screen}
                                    style={{
                                        width: "100%",
                                        height: 130,
                                    }}
                                />
                                <View style={{ padding: 5 }}>
                                    <TextButton style={{ fontSize: 15 }}>Your Friends</TextButton>
                                    <Text style={{ fontSize: 10 }}>Seen orders friends were your friends</Text>
                                </View>
                            </ButtonLiveStream>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default HomePageLayout;
const ButtonLiveStream = styled.TouchableOpacity`
padding:5px
backgroundColor:white
borderRadius:5px;
marginHorizontal:10px;
borderWidth:0.3px;
borderColor:gray;
shadowColor: gray
        shadowOffset: { width: 1, height: 1}
        shadowOpacity:  0.2
        shadowRadius: 3px
        elevation: 5
`
const TextButton = styled.Text`
color: black;
fontWeight: bold;
fontSize: 15px
`
const ImageStyled=styled.Image`
borderRadius:5px;

`