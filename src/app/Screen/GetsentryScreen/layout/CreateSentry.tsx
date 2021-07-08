import React, { useState } from 'react'
import { View, Text, ActivityIndicator, Button, TextInput, FlatList } from 'react-native'
import { useAppDispatch, useAppSelector } from '@app/store'
import { TextField } from '@components'
import { Formik } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components/native'
const SignupSchema = Yup.object().shape({
    email: Yup.string().required('Bạn cần nhập email'),
    password: Yup.string()
        .min(6, 'Phải lớn hơn 6 kí tự!')
        .max(50, 'Phải nhỏ hơn 50 kí tự!')
        .required('Cần nhập mật khẩu'),
});
const CreateSentry = () => {
    const appDispatch = useAppDispatch()
    
    const mySentryReducer = useAppSelector(state => state.mySentryReducer)
    React.useEffect(() => {
        
    })
    return (
        <View >
            <Formik
                initialValues={{
                    email: '',
                    password: ''
                }}
                validationSchema={SignupSchema}
                onSubmit={values => console.log(values)}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <View style={{ padding: 10 }}>
                        <TextField
                            onChange={handleChange('email')}
                            onBlur={handleBlur('email')}
                            value={values.email}
                            placeholder="email"
                            errors={errors.email}
                            type="email"
                            touched={touched.email}
                        />
                        <TextField
                            onChange={handleChange('password')}
                            onBlur={handleBlur('password')}
                            value={values.password}
                            placeholder="password"
                            type="password"
                            errors={errors.password}
                            touched={touched.password}
                        />
                        <ButtonStyled onPress={handleSubmit}>
                            <TextButton> Submit</TextButton>
                        </ButtonStyled>
                    </View>
                )}
            </Formik>
        </View>
    )
}
export default CreateSentry
const ButtonStyled = styled.TouchableOpacity`
alignItems: center
backgroundColor:blue;
borderRadius:10px
padding:5px
top:10px;
 `
const TextButton = styled.Text`
 fontSize:15px
 color:white
 fontWeight:bold
 `
