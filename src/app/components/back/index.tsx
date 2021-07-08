import React, { JSXElementConstructor, useState } from 'react';
import styled from 'styled-components';
import { Icon_Image } from '../../../assets/image';

interface State {
    title?: any;
    onClickIcon?: Function;
    icon?: any;
    styleIcon?:any;
    styleTitle?:any;
    ViewMore?:any;
    style?:any
}

const GoBack = (props: State) => {
    const { onClickIcon, title,styleIcon,styleTitle, ViewMore, icon ,style} = props
    return (
        <ViewContainer style={style} >
            <ButtonIcon onPress={onClickIcon}>
                <ImageStyled style={styleIcon??null} source={icon??Icon_Image.go_back_ic} />
            </ButtonIcon>
            <TextTitle style={styleTitle??null}>{title}</TextTitle>
            {ViewMore&&<ViewMore />}
        </ViewContainer>
    );
};

export default GoBack;

const ViewContainer = styled.View`
paddingVertical:15px
height: 60px;
borderBottomWidth: 0.5px;
borderColor: #0B3B17;
flexDirection:row;
alignItems:center;
paddingHorizontal:10px
`;
const ButtonIcon = styled.TouchableOpacity`

`
const ImageStyled = styled.Image`
width: 15px;
height: 15px;
left: 5px;
top:1px
`;
const TextTitle = styled.Text`
fontSize:17px;
color:#0B3B17;
fontWeight:bold;
marginLeft:20px;
`;
