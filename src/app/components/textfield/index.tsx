import React from 'react'

import { View, Text ,TextInput} from 'react-native'
import styled from 'styled-components/native'

interface State {
    value?:any
    onChange?:Function
    styled?:any
    onBlur?:Function
    errors?:any
    touched?:any
    placeholder?:string;
    type?:any;
    label?:string;
    password?:boolean;
    style?:any;
    styleTitle?:any;
}

const TextField = (props: State) => {
    const {value,password,onChange,styled,styleTitle,onBlur,label,errors,touched,placeholder,type}=props
    return (
        <View style={{padding:8}}>
            <Label style={styleTitle}>{label??placeholder}</Label>
            <TextInputStyled
                style={styled}
                placeholder={placeholder??null}
                onChangeText={onChange}
                value={value}
                onBlur={onBlur}
                secureTextEntry={password??false}
            />
            {errors && touched?<View><Error>{errors}</Error></View> : null}
        </View>
    )
}
export default TextField

const TextInputStyled=styled.TextInput`
height:40px;
borderWidth:0.4px;
borderColor:black;
borderRadius:10px;
padding:10px
`
const Error=styled.Text`
margin:3px
color:red;
fontStyle:italic;
fontSize:12px
`
const Label=styled.Text`
margin:5px
color:#0B3B17;
fontSize:14px;
`