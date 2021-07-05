import React, { useState } from 'react'
import { View, Text, Image } from 'react-native'

import styled from 'styled-components/native'
import { Icon_Image } from '../../../assets/image' ;
interface State {
    item?: any;
    onClick?:Function;
}
const Sentry = (props: State) => {
    const { item,onClick } = props

    return (
        <ViewContainer onPress={onClick}>
            <ViewDirection >
                <Image source={Icon_Image.sentry} style={{ width: 15, height: 20 }} />
                <TextTitle>
                    {item.name}
                </TextTitle>
            </ViewDirection>
            <TextDescription >
                {item.description}
            </TextDescription>
            <ViewDirection>
                <ViewDirection>
                    <DotStyled />
                    <TextFooter>
                        {item.language}
                    </TextFooter>
                </ViewDirection>

                <ViewDirection>
                    <ImageStyled source={Icon_Image.star}/>
                    <TextFooter>
                        {item.forks_count}
                    </TextFooter>
                </ViewDirection>

                <ViewDirection>
                    <ImageStyled source={Icon_Image.share}/>
                    <TextFooter>
                        {item.watchers}
                    </TextFooter>
                </ViewDirection>
            </ViewDirection>
        </ViewContainer>
    )
}
export default Sentry

const ViewContainer = styled.TouchableOpacity`
margin:10px;
borderRadius:5px;
borderWidth:0.3px;
borderColor:gray;
padding:10px
`
const TextTitle = styled.Text`
color: #2E9AFE;
fontWeight:bold;
marginLeft:5px
`
const TextDescription = styled.Text`
marginTop:5px
`
const ViewDirection = styled.View`
flexDirection:row;
paddingTop:5px
`
const DotStyled = styled.View`
backgroundColor:#2E9AFE;
borderRadius:5px;
width:10px;
height:10px
`
const TextFooter = styled.Text`
marginTop:-5px;
marginLeft:5px
`
const ImageStyled = styled.Image`
width: 15px;
 height: 15px;
 marginTop:-2px;
 marginLeft:20px;
`