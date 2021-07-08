import { RouterName } from "@app/navigation/router_name";
import { Icon_Image } from "@assets/image";
import React, { useState } from "react";
import {Platform } from 'react-native'
import styled from 'styled-components'
const HeaderHomeLayout = ({navigation}) => {
    const [search, setSearch] = useState("")
    return (
        <ViewContainerStyled style={{
            paddingTop: Platform.OS === "android" ? 10 : 40,
            marginBottom:10
        }}>
            <ViewDirectionRow style={{ paddingHorizontal: 10,paddingVertical:5 }}>
                <TextStyled>Ago Live</TextStyled>
                <ViewDirectionRow>
                    <ButtonStyled onPress={() => {
                        navigation.navigate(RouterName.NotificationScreen)
                    }}>
                        <ImageStyled source={Icon_Image.notification}/>
                    </ButtonStyled>
                    <ButtonStyled onPress={() => {
                        navigation.navigate(RouterName.SettingScreen)
                    }}>
                        <ImageStyled
                            source={Icon_Image.setting_ic}/>
                    </ButtonStyled>
                </ViewDirectionRow>
            </ViewDirectionRow>
            <ViewSearchStyled>
                <TextInputStyled
                    value={search}
                    placeholder="What about ..."
                    onChangeText={(text) => {
                        setSearch(text)
                    }}
                />
                <ButtonStyled onPress={() => {
                    
                }}>
                    <ImageStyled source={Icon_Image.search_ic} />
                </ButtonStyled>
            </ViewSearchStyled>
        </ViewContainerStyled>
    )
}
export default HeaderHomeLayout
const ViewContainerStyled = styled.View`
width:100%;
paddingVertical:20px;
paddingHorizontal:10px;
backgroundColor:white;
borderBottomWidth:0.3px;
borderBottomColor:#DCDCDC;
borderBottomRightRadius: 40px
`;
const ViewDirectionRow = styled.View`
flexDirection:row;
justifyContent:space-between;
marginVertical:5px;
`;
const TextStyled = styled.Text`
fontSize:16px;
color:black;
fontWeight:bold`

const ImageStyled = styled.Image`
width:20px;
height:20px;
`
const ButtonStyled = styled.TouchableOpacity`
marginHorizontal:10px;
justifyContent:center;
alignItems:center
`
const ViewSearchStyled = styled.View`
marginHorizontal:10px
marginVertical:5px;
flexDirection:row;
justifyContent:space-around
borderColor:gray;
borderWidth:0.3px;
borderRadius:18px;
alignItems:center;
`
const TextInputStyled = styled.TextInput`
width:80%;
height:40px;
`