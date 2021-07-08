import React, { useState } from 'react'
import { View, Text, ActivityIndicator,TouchableOpacity, Button, TextInput, FlatList } from 'react-native'
import { useAppDispatch, useAppSelector } from '@app/store'
import { TextField } from '@components'
import { Formik } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components'
import { Icon_Image } from '@assets/image';
import { requestUserThunk } from '@screen/AuthScreen/slice/RegisterUserSlice';
import { RouterName } from '@navigation/router_name';
// Validate Form 
const SignUpSchema = Yup.object().shape({
    name: Yup.string().required('Bạn cần nhập tên'),
    email: Yup.string().email("Bạn cần nhập định dạng email").required('Bạn cần nhập email'),
    password: Yup.string()
        .min(6, 'Phải lớn hơn 6 kí tự!')
        .max(50, 'Phải nhỏ hơn 50 kí tự!')
        .required('Cần nhập mật khẩu'),
    phone_number: Yup.string().required('Bạn cần nhập số điện thoại'),
});

const RegisterLayout = ({navigation}) => {
    const appDispatch = useAppDispatch()
    const registerUserReducer = useAppSelector(state => state.registerUserReducer)

    React.useEffect(() => {

    }, [])

    const onSubmit = (value) => {
        let userData ={
            ...value,role: 0,gender: 0,status: 0}
        appDispatch(requestUserThunk(userData))
    }
    // Alert message
    if (!registerUserReducer.error && registerUserReducer.success_message) {
        alert(registerUserReducer.success_message)
    }

    return (
        <View style={{ backgroundColor: "white" ,flex:1}}>
            <View style={{ alignItems: "center", marginTop: 20 }}>
                <ImageStyled source={Icon_Image.logoWindSoft} />
            </View>
            <TextTitle>Register</TextTitle>
            <Formik
                initialValues={{
                    name: '',
                    email: '',
                    password: '',
                    phone_number: ""
                }}
                validationSchema={SignUpSchema}
                onSubmit={(values, { resetForm }) => {
                    onSubmit(values)
                    resetForm()
                }}>
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <View style={{ padding: 10,flex:1 }}>
                        <TextField
                            onChange={handleChange('name')}
                            onBlur={handleBlur('name')}
                            value={values.name}
                            errors={errors.name}
                            touched={touched.name}
                            label="Name"
                        />
                        <TextField
                            onChange={handleChange('phone_number')}
                            onBlur={handleBlur('phone_number')}
                            value={values.phone_number}
                            errors={errors.phone_number}
                            touched={touched.phone_number}
                            label="Number Phone"
                        />
                        <TextField
                            onChange={handleChange('email')}
                            onBlur={handleBlur('email')}
                            value={values.email}
                            errors={errors.email}
                            touched={touched.email}
                            label="Email"
                        />
                        <TextField
                            onChange={handleChange('password')}
                            onBlur={handleBlur('password')}
                            value={values.password}
                            password={true}
                            errors={errors.password}
                            touched={touched.password}
                            label="Password"
                        />
                        <TouchableOpacity onPress={()=>{
                            navigation.navigate(RouterName.Login_Screen)
                        }}>
                        <Text style={{marginLeft:10,marginTop:5,color:"blue",fontSize:11}}>Đăng nhập</Text>
                        </TouchableOpacity>
                        
                        <ButtonStyled onPress={handleSubmit}>
                            <TextButton>Register</TextButton>
                        </ButtonStyled>
                    </View>
                )}
            </Formik>
            {registerUserReducer.isLoading?<ActivityIndicator color="red" /> : null}
        </View>
    )
}
export default RegisterLayout
const ButtonStyled = styled.TouchableOpacity`
alignItems: center
backgroundColor: #084B8A;
borderRadius:15px
padding:5px
marginTop:15px;
marginHorizontal:80px
 `
const TextButton = styled.Text`
 fontSize:15px
 color:white
 fontWeight:bold
 `
const TextTitle = styled.Text`
 textAlign:center;
 fontSize:20px;
 color:#0B3B17;
 fontWeight:bold
 marginTop:20px
 `
const ImageStyled = styled.Image`
`
