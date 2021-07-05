import { createAsyncThunk, createSlice, unwrapResult } from '@reduxjs/toolkit'
import axios from 'axios'
import {Notification} from '@app/model'
import { GenericListInitialState } from '@app/Screen/GetsentryScreen/slice/GenericListInitialState'
import { ApiURL } from '@app/network/api'
export const initialState: GenericListInitialState<Notification> = {
    isLoading: false,
    error: null,
    data:[],
}
export const requestNotificationThunk = createAsyncThunk(
    'user/get', async () => {
        const response = await axios.get(ApiURL.Notification).then((res) => {
            return res.data
        }).catch((e)=>{
            console.log("Error");
        })
        return response
    },
)
export const NotificationSlice = createSlice({
    name: 'user/get',
    initialState,
    reducers: {
        clearCache: (state, action) => { },
    },
    extraReducers: builder => {
        builder.addCase(requestNotificationThunk.pending, (state, action) => {
            state.isLoading = true
        })
        builder.addCase(requestNotificationThunk.fulfilled, (state, action) => {
            state.isLoading = false
            state.error = false
            state.data=action.payload
        })
        builder.addCase(requestNotificationThunk.rejected, (state, action) => {
            state.isLoading = false
            state.error = true
        })
    },
})
export default NotificationSlice.reducer
