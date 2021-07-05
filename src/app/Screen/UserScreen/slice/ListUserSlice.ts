import { createAsyncThunk, createSlice, unwrapResult } from '@reduxjs/toolkit'
import axios from 'axios'
import { initialState, User } from '../../../model'
import { ApiURL } from '../../../network/api'

export const requestListUserThunk = createAsyncThunk(
    'user/get', async () => {
        const response = await axios.get(ApiURL.User).then((res) => {
            return res.data
        }).catch((e)=>{
            console.log("Error");
        })
        return response
    },
)
export const ListUserSlice = createSlice({
    name: 'user/get',
    initialState,
    reducers: {
        clearCache: (state, action) => { },
    },
    extraReducers: builder => {
        builder.addCase(requestListUserThunk.pending, (state, action) => {
            state.isLoading = true
        })
        builder.addCase(requestListUserThunk.fulfilled, (state, action) => {
            state.isLoading = false
            state.error = false
            state.listUser=action.payload
        })
        builder.addCase(requestListUserThunk.rejected, (state, action) => {
            state.isLoading = false
            state.error = true
        })
    },
})
export default ListUserSlice.reducer
