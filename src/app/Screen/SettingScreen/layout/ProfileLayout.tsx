import React, {useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Button,Platform,
  TextInput,
  FlatList,
} from 'react-native';

import {useAppDispatch, useAppSelector} from '@app/store';
import {TextField,GoBackLayout} from '@components';
import {Formik} from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components/native';
import {Icon_Image} from '@assets/image';
import {requestProfileThunk} from '../slice/ProfileSlice';

import {connect} from 'react-redux';
import {update} from '@screen/AuthScreen/slice/LoginUserSlice';
// Validate Form
const SignUpSchema = Yup.object().shape({
  name: Yup.string().required('Bạn cần nhập tên'),
  email: Yup.string()
    .email('Bạn cần nhập định dạng email')
    .required('Bạn cần nhập email'),
  password: Yup.string()
    .min(6, 'Phải lớn hơn 6 kí tự!')
    .max(50, 'Phải nhỏ hơn 50 kí tự!')
    .required('Cần nhập mật khẩu'),
  phone_number: Yup.string().required('Bạn cần nhập số điện thoại'),
});

const mapDispatch = {
  update,
};

const ProfileLayout = ({navigation}) => {
  const appDispatch = useAppDispatch();
  const ProfileReducer = useAppSelector(state => state.ProfileReducer);
  const loginUserReducer = useAppSelector(state => state.loginUserReducer);
  React.useEffect(() => {}, [ProfileReducer.userLogin]);

  const onSubmit = value => {
    let userData = {
      ...value,
      role: 0,
      gender: 0,
      status: 0,
    };
    appDispatch(requestProfileThunk({model: userData, id: userData.id}));

    if (!ProfileReducer.error && ProfileReducer.success_message) {
      alert(ProfileReducer.success_message);
    }
    appDispatch(update(value));
  };
  // Alert message
  return (
    <View style={{backgroundColor: 'white',flex:1,marginVertical:Platform.OS==="android"?0:25}}>
      
       <GoBackLayout 
       title="Update Profile" onClickIcon={()=>{navigation.goBack()}}
       
       />
      {loginUserReducer.userLogin && (
        <Formik
          initialValues={loginUserReducer.userLogin}
          validationSchema={SignUpSchema}
          onSubmit={values => {
            onSubmit(values);
          }}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={{padding: 10}}>
              <TextField
                onChange={handleChange('name')}
                onBlur={handleBlur('name')}
                value={values.name}
                errors={errors.name}
                touched={touched.name}
                label="Name"
                
                styled={{borderColor:"red"}}
              />
              <TextField
                onChange={handleChange('phone_number')}
                onBlur={handleBlur('phone_number')}
                value={values.phone_number}
                errors={errors.phone_number}
                touched={touched.phone_number}
                label="Number Phone"
                styled={{borderColor:"red"}}
              />
              <TextField
                onChange={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                errors={errors.email}
                touched={touched.email}
                label="Email"styled={{borderColor:"red"}}
              />
              <TextField
                onChange={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                password={true}
                errors={errors.password}
                touched={touched.password}
                label="Password"
                styled={{borderColor:"red"}}
              />
              <ButtonStyled onPress={handleSubmit}>
                <TextButton>Update</TextButton>
              </ButtonStyled>
            </View>
          )}
        </Formik>
      )}
      {ProfileReducer.isLoading ? <ActivityIndicator color="red" /> : null}
    </View>
  );
};

export default connect(null, mapDispatch)(ProfileLayout);
const ButtonStyled = styled.TouchableOpacity`
alignItems: center
backgroundColor: red;
borderRadius:15px
padding:10px
marginTop:15px;
marginHorizontal:80px
 `;
const TextButton = styled.Text`
 fontSize:15px
 color:white
 fontWeight:bold
 `;

