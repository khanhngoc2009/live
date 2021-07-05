import { createAsyncThunk, createSlice, unwrapResult } from '@reduxjs/toolkit'
import axios from 'axios'
import { stat } from 'fs'
import { initialState } from './initState'

export const requestSentryThunk = createAsyncThunk(
    'sentries', async (page: number) => {
        const response = await axios.get(`https://api.github.com/orgs/getsentry/repos?page=${page}&&per_page=${7}`).then((res) => {
            return res.data
        })
        return response
    },
)

export const mySentrySlice = createSlice(
    {
        name: 'sentries',
        initialState,
        reducers: {
            change_detail: (state, action) => {
                state.sentry_detail=action.payload
            },
        },
        extraReducers: builder => {
            builder.addCase(requestSentryThunk.pending, (state, action) => {
                state.isLoading = true
                state.isLoadMore = true
            })
            builder.addCase(requestSentryThunk.fulfilled, (state, action) => {
                state.isLoading = false
                state.error = false
                state.data = action.meta.arg != 1 ? state.data?.concat(action.payload) : action.payload
                state.isLoadMore = false
            })
            builder.addCase(requestSentryThunk.rejected, (state, action) => {
                state.isLoading = false
                state.isLoadMore = false
                state.error = true
            })
        },
    }
)
export const { change_detail } = mySentrySlice.actions
export default mySentrySlice.reducer
