import React from "react";
import {View} from 'react-native'
import styled from 'styled-components/native'
import GoBack from '../../../components/back'
import { useAppDispatch, useAppSelector } from '../../../store'
const SentryDetailScreen=({navigation})=>{
    const mySentryReducer = useAppSelector(state => state.mySentryReducer)
    console.log(mySentryReducer.sentry_detail);
    return(
        <Container>
            <GoBack 
            title="Sentry Detail"
            onClickIcon={()=>{
                navigation.goBack();
            }}
            />
            <ViewContent >
                <View style={{marginVertical:20}}>
                    <TextTitle>Name:  <TextContent>{mySentryReducer.sentry_detail?.name}</TextContent></TextTitle> 
                    <TextTitle>Description: <TextContent> {mySentryReducer.sentry_detail?.description}</TextContent></TextTitle> 
                    <TextTitle>Forks: <TextContent> {mySentryReducer.sentry_detail?.forks}</TextContent></TextTitle> 
                    <TextTitle>Forks_count: <TextContent> {mySentryReducer.sentry_detail?.forks_count}</TextContent></TextTitle> 
                    <TextTitle>Full_name: <TextContent> {mySentryReducer.sentry_detail?.full_name}</TextContent></TextTitle> 
                    <TextTitle>Language: <TextContent> {mySentryReducer.sentry_detail?.language}</TextContent></TextTitle> 
                    <TextTitle>Open_issues: <TextContent> {mySentryReducer.sentry_detail?.open_issues}</TextContent></TextTitle> 
                    <TextTitle>Watchers: <TextContent> {mySentryReducer.sentry_detail?.watchers}</TextContent></TextTitle> 
                </View>
            </ViewContent>
        </Container>
    )
}
export default SentryDetailScreen

const Container=styled.View`
flex:1;
paddingHorizontal:10px;
paddingVertical:30px;
`
const ViewContent=styled.View`
paddingHorizontal:10px;
alignContent:center;
`
const ViewDirectionRow=styled.View`
flexDirection:row;
justifyContent:space-around
`

const TextContent=styled.Text`
color:red;
fontWeight:bold
`
const TextTitle=styled.Text`
marginTop:15px
`

