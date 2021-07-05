import { createAsyncThunk, createSlice, unwrapResult } from '@reduxjs/toolkit'
import axios from 'axios'
import { initialState, User } from '../../../model'
import { ApiURL } from '../../../network/api'

export const requestUserThunk = createAsyncThunk(
    'user/post', async (model:User) => {
        
        const response = axios.post(ApiURL.User,model).then((res) => {
            return res.data
        }).catch((e)=>{
            console.log("lỗi rồi");
        })
        return  response
    },
)
export const RegisterUserSlice = createSlice({
    name: 'user/post',
    initialState,
    reducers: {
        clearCache: (state, action) => { },
    },
    extraReducers: builder => {
        builder.addCase(requestUserThunk.pending, (state, action) => {
            state.isLoading = true
        })
        builder.addCase(requestUserThunk.fulfilled, (state, action) => {
            state.isLoading = false
            state.error = false
            state.success_message=action.payload?"Register Success":"Fail"
        })
        builder.addCase(requestUserThunk.rejected, (state, action) => {
            state.isLoading = false
            state.error = true
        })
    },
})
export default RegisterUserSlice.reducer
