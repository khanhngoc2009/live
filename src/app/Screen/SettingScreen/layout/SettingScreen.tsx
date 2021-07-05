import React from "react";
import { Platform, View, ImageBackground, ScrollView, TouchableOpacity } from "react-native";
import { GoBackLayout as GoBack } from '@components'
import { RouterName } from "@app/navigation/router_name";
import styled from 'styled-components/native'
import { Icon_Image } from "@assets/image";
import { useAppDispatch, useAppSelector } from '@app/store'
import { logout } from "@screen/AuthScreen/slice/LoginUserSlice";
const SettingScreen = ({ navigation }) => {
    const appDispatch = useAppDispatch()
    const onLogout=()=>{
        appDispatch(logout(null));
    }
    return (
        <View style={{ paddingVertical: Platform.OS === "ios" ? 40 : 10, flex: 1 }}>
            <GoBack
                title="Setting"
                onClickIcon={() => {
                    navigation.goBack()
                }} />
            <ImageBackground style={{
                height: 200, alignItems: "center",
                justifyContent: "flex-end",
                width: "100%"
            }} source={Icon_Image.live_Image_home_screen}>
                <BackgroundImageProfile >
                    <ImageStyled style={{
                        height: 150,
                        width: 150,
                        borderRadius: 75
                    }} source={Icon_Image.image_boy_profile} />
                </BackgroundImageProfile>
            </ImageBackground>
            <ScrollView style={{ marginTop: 60 }}>
                <ViewDirectionStyled>
                    <ContentStyled >
                        <ButtonSettingStyled onPress={() => { navigation.navigate(RouterName.UpdateInfo_Screen) }}>
                            <ImageStyled source={Icon_Image.profile} style={{ width: 30, height: 30 }} />
                            <TextStyled >Update Profile</TextStyled>
                        </ButtonSettingStyled>
                        <ButtonSettingStyled onPress={() => { }}>
                        </ButtonSettingStyled>
                        <ButtonSettingStyled onPress={() => { }}>
                        </ButtonSettingStyled>
                    </ContentStyled>
                    <ContentStyled >
                        <ButtonSettingStyled onPress={() => { }}>
                        </ButtonSettingStyled>
                        <ButtonSettingStyled onPress={() => { }}>
                        </ButtonSettingStyled>
                        <ButtonSettingStyled onPress={() => { }}>
                        </ButtonSettingStyled>
                    </ContentStyled>
                </ViewDirectionStyled>
                {/* <TextStyled style={{ textAlign: "center", marginVertical: 20 }}>Version 1.0</TextStyled> */}
                <View
                style={{alignItems:"flex-end",paddingHorizontal:20}}
                ><ButtonSettingStyled style={{width:100,height:40}} onPress={()=>{
                    onLogout();
                }}>
                    <TextStyled style={{color:"red"}}>Log out</TextStyled>
                </ButtonSettingStyled></View>
            </ScrollView>
        </View>
    )
}
export default SettingScreen
const HeaderStyled = styled.View`
backgroundColor:red;
height:200px;
`
const BackgroundImageProfile = styled.TouchableOpacity`
top:50px
`
const ContentStyled = styled.View`
width:47.5%;
padding:2.5%
`
const TextStyled = styled.Text`
marginTop:5px
`
const ImageStyled = styled.Image`
`
const ViewDirectionStyled = styled.View`
flexDirection:row;
`
const ButtonSettingStyled = styled.TouchableOpacity`
width:100%
height:80px
padding:5px
marginVertical:10px;
backgroundColor:white
borderRadius:5px;
alignItems:center
justifyContent:center
marginHorizontal:10px;
borderWidth:0.3px;
borderColor:gray;
shadowColor: gray
        shadowOffset: { width: 1, height: 1}
        shadowOpacity:  0.2
        shadowRadius: 3px
        elevation: 5
`
