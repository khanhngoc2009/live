import { stringTypeAnnotation } from '@babel/types'
import { createAsyncThunk, createSlice, unwrapResult } from '@reduxjs/toolkit'
import axios from 'axios'
import { initialState, User } from '../../../model'
import { ApiURL } from '../../../network/api'

export const requestLoginThunk = createAsyncThunk(
    'user/login', async (param: { email: string, password: string }) => {
        const response = axios.get(ApiURL.User).then((res) => {
            let user = res.data.find((e) => e.email == param.email && e.password == param.password)
            return user ?? null
        }).catch((e) => {
        })
        return await response
    },
)
export const LoginUserSlice = createSlice({
    name: 'user/login',
    initialState,
    reducers: {
        update: (state, action) => {
            state.userLogin=action.payload  
        },
        logout:(state,action)=>{
            state.userLogin={}
            state.isLogin=false;
            state.success_message=""
        }
    },
    extraReducers: builder => {
        builder.addCase(requestLoginThunk.pending, (state, action) => {
            state.isLoading = true
            state.success_message = ""
        })
        builder.addCase(requestLoginThunk.fulfilled, (state, action) => {
            state.isLoading = false
            state.error = false
            state.success_message = action.payload ? "Login Success" : "Email or Password incorrect"
            state.isLogin = action.payload ? true : false
            state.userLogin = action.payload ?? {}
        })
        builder.addCase(requestLoginThunk.rejected, (state, action) => {
            state.isLoading = false
            state.error = true
        })
    },
    
})

export const { update ,logout} = LoginUserSlice.actions
export default LoginUserSlice.reducer
