import { createAsyncThunk, createSlice, unwrapResult } from '@reduxjs/toolkit'
import axios from 'axios'
import { initialState, User } from '../../../model'
import { ApiURL } from '../../../network/api'

export const requestProfileThunk = createAsyncThunk(
    'user/put', async (param:{model:User,id:string}) => {
        const response = await axios.put(ApiURL.User+`/${param.id}`,param.model).then((res) => {
            
            return res.data
        }).catch((e)=>{
            console.log("Error");
        })
        return response
    },
)
export const ProfileSlice = createSlice({
    name: 'user/put',
    initialState,
    reducers: {
        clearCache: (state, action) => { },
    },
    extraReducers: builder => {
        builder.addCase(requestProfileThunk.pending, (state, action) => {
            state.isLoading = true
            state.success_message=null
        })
        builder.addCase(requestProfileThunk.fulfilled, (state, action) => {
            state.isLoading = false
            state.error = false
            state.success_message=action.payload?"Update success":"Update Fail"
            state.userLogin=action.payload
        })
        builder.addCase(requestProfileThunk.rejected, (state, action) => {
            state.isLoading = false
            state.error = true
        })
    },
})
export default ProfileSlice.reducer
