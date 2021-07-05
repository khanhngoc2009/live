import { createAsyncThunk, createSlice, unwrapResult } from '@reduxjs/toolkit'
import axios from 'axios'
import {Live} from '@app/model'
import { GenericListInitialState } from '@app/Screen/GetsentryScreen/slice/GenericListInitialState'
import { ApiURL } from '@app/network/api'
export const initialState: GenericListInitialState<Live> = {
    isLoading: false,
    error: null,
    data:[],
}
export const requestLiveThunk = createAsyncThunk(
    'live/get', async () => {
        const response = await axios.get(ApiURL.Live).then((res) => {
            return res.data
        }).catch((e)=>{
            console.log("Error");
        })
        return response
    },
)
export const LiveRoomSlice = createSlice({
    name: 'live/get',
    initialState,
    reducers: {
        clearCache: (state, action) => { },
    },
    extraReducers: builder => {
        builder.addCase(requestLiveThunk.pending, (state, action) => {
            state.isLoading = true
        })
        builder.addCase(requestLiveThunk.fulfilled, (state, action) => {
            state.isLoading = false
            state.error = false
            state.data=action.payload
        })
        builder.addCase(requestLiveThunk.rejected, (state, action) => {
            state.isLoading = false
            state.error = true
        })
    },
})
export default LiveRoomSlice.reducer
