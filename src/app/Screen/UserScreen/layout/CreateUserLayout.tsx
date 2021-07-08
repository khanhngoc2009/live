import React, { useState } from 'react'
import * as Yup from 'yup';
import { ActivityIndicator, Platform,View } from 'react-native'
import RadioForm from 'react-native-simple-radio-button';
import { useAppDispatch, useAppSelector } from '@app/store'
import { Formik } from 'formik';
import { TextField,GoBackLayout as GoBack } from '@components/index'
import styled from 'styled-components'
import {requestUserThunk} from '@screen/AuthScreen/slice/RegisterUserSlice'
import {SentryLayout} from '@components'
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
const CreateUserLayout = ({ navigation }) => {
    const appDispatch = useAppDispatch()
    const registerUserReducer = useAppSelector(state => state.registerUserReducer)
    const [valueGender, setValueGender] = React.useState(0);
    const [valueRole, setValueRole] = React.useState(0);
    const radio_gender = [
        { label: 'Nam', value: 0 },
        { label: 'Nữ', value: 1 }
    ];
    const radio_role = [
        { label: 'Admin', value: 0 },
        { label: 'User', value: 1 }
    ];
    const onSubmit = (value) => {
        let userData = {
            ...value, role: valueRole, gender: valueGender, status: 0}
        appDispatch(requestUserThunk(userData))
    }
    return (
        <View style={{ backgroundColor: "white", flex: 1 }}>
            <GoBack
                style={{
                    marginTop: Platform.OS === "android" ? 0 : 40
                }}
                title="Create User Screen"
                onClickIcon={() => {
                    navigation.goBack()
                }} />
            <Formik
                initialValues={{
                    name: '',
                    email: '',
                    password: '',
                    phone_number: "",
                    role:0
                }}
                validationSchema={SignUpSchema}
                onSubmit={(values, { resetForm }) => {
                    onSubmit(values)
                    resetForm()
                }}>
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <View style={{ padding: 20, flex: 1 }}>
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

                        <ViewFlexDirectionRow>
                            <RadioForm
                                radio_props={radio_gender}
                                initial={valueGender}
                                formHorizontal={true}
                                labelHorizontal={true}
                                buttonColor={'#2196f3'}
                                animation={true}
                                value={valueGender}
                                onPress={(value) => { 
                                    setValueGender(value)
                                }}
                                style={{padding:10}}
                            />
                            <RadioForm
                                radio_props={radio_role}
                                initial={valueRole}
                                formHorizontal={true}
                                labelHorizontal={true}
                                buttonColor={'#2196f3'}
                                animation={true}
                                value={valueRole}
                                onPress={(value) => { 
                                    setValueRole(value)
                                }}
                                style={{padding:10}}
                            />
                        </ViewFlexDirectionRow>
                        <ButtonStyled onPress={handleSubmit}>
                            <TextButton>Create</TextButton>
                        </ButtonStyled>
                    </View>
                )}
            </Formik>
            {registerUserReducer.isLoading ? <ActivityIndicator color="red" /> : null}
            
        </View>
    )
}
export default CreateUserLayout
const ButtonStyled = styled.TouchableOpacity`
alignItems: center
backgroundColor: red;
borderRadius:18px
paddingVertical:10px
marginTop:20px;
marginHorizontal:70px
 `
const TextButton = styled.Text`
 fontSize:15px
 color:white
 fontWeight:bold
 `
const ViewFlexDirectionRow = styled.View`
 flexDirection:row;
 justifyContent:space-around
 `
