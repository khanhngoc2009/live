import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Button, TextInput, FlatList } from 'react-native'
import { useAppDispatch, useAppSelector } from '@app/store'
import { TextField } from '@components'
import { Formik } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components/native'
import { Icon_Image } from '@assets/image';
import { requestLoginThunk } from '@screen/AuthScreen/slice/LoginUserSlice';
import { RouterName } from '@navigation/router_name';
// Validate Form 
const SignUpSchema = Yup.object().shape({
    email: Yup.string().email("Sai đinh dạng email").required('Bạn cần nhập email'),
    password: Yup.string()
        .min(6, 'Phải lớn hơn 6 kí tự!')
        .max(50, 'Phải nhỏ hơn 50 kí tự!')
        .required('Bạn cần nhập mật khẩu'),
});
const LoginLayout = ({navigation}) => {
    const appDispatch = useAppDispatch()

    const LoginReducer = useAppSelector(state => state.loginUserReducer)
    React.useEffect(() => {

    }, [])

    // Alert message
    // if (LoginReducer.userLogin && LoginReducer.success_message) {
    //     alert(LoginReducer.success_message)
    // }
    //onLogin
    const onLoginSubmit = (value) => {
        appDispatch(requestLoginThunk({ email: value.email, password: value.password }))
    }

    return (
        <View style={{ backgroundColor: "#511982" ,flex:1,justifyContent:"center"}}>
            {/* <View style={{ alignItems: "center", marginTop: 20 }}>
                <ImageStyled source={Icon_Image.logoWindSoft} />
            </View> */}
            
            <Formik
                initialValues={{
                    email: 'phamva@gmail.com',
                    password: '445455545'
                }}
                validationSchema={SignUpSchema}
                onSubmit={(values, { resetForm }) => {
                    onLoginSubmit(values)
                    resetForm()
                }}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <View style={{ paddingVertical: 20,paddingHorizontal:20 ,
                    
                    }}>
                        <TextTitle>Login App</TextTitle>
                        <TextField
                            onChange={handleChange('email')}
                            onBlur={handleBlur('email')}
                            value={values.email}
                            errors={errors.email}
                            touched={touched.email}
                            label="Email"
                            styleTitle={{color:"white"}}
                            styled={{padding:5,borderColor:"white",color:"white"}}
                        />
                        <TextField
                            onChange={handleChange('password')}
                            onBlur={handleBlur('password')}
                            value={values.password}
                            password={true}
                            errors={errors.password}
                            touched={touched.password}
                            label="Password"
                            styleTitle={{color:"white"}}
                            styled={{padding:5,borderColor:"#fff",color:"white"}}
                        />
                        <ButtonStyled onPress={handleSubmit}
                        >
                            <TextButton>Login</TextButton>
                        </ButtonStyled>
                        <TouchableOpacity
                        style={{alignItems:"center",padding:20}}
                         onPress={() => {
                            navigation.navigate(RouterName.Register_Screen)
                         }}>
                            <Text style={{ marginLeft: 10, marginTop: 5, color: "white", fontSize: 11 }}>Đăng kí ?</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Formik>
            {LoginReducer.isLoading ? <ActivityIndicator color="red" /> : null}
        </View>
    )
}
export default LoginLayout
const ButtonStyled = styled.TouchableOpacity`
alignItems: center
backgroundColor: #9c26b0;
borderRadius:10px
padding:10px
marginTop:15px;
marginHorizontal:30px;
 `
const TextButton = styled.Text`
 fontSize:17px
 color:white
 fontWeight:bold
 `
const TextTitle = styled.Text`
 textAlign:center;
 fontSize:25px;
 color:white;
 fontWeight:bold
 marginTop:20px
 `
const ImageStyled = styled.Image`
`
