import {configureStore, ThunkAction, Action} from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import  mySentryReducer from '@screen/GetsentryScreen/slice/ListSentrySlice';
import  registerUserReducer from '@screen/AuthScreen/slice/RegisterUserSlice';
import  loginUserReducer from '@screen/AuthScreen/slice/LoginUserSlice';
import ProfileReducer from '@screen/SettingScreen/slice/ProfileSlice'
import ListUserReducer from '@screen/UserScreen/slice/ListUserSlice'
import NotificationReducer from './store/notification/NotificationSlice';
import LiveRoomReducer from './store/live/LiveRoomSlice';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux'

export const store = configureStore({
  reducer: {
    mySentryReducer: mySentryReducer,
    registerUserReducer:registerUserReducer,
    loginUserReducer:loginUserReducer,
    ProfileReducer:ProfileReducer,
    ListUserReducer:ListUserReducer,
    NotificationReducer:NotificationReducer,
    LiveRoomReducer:LiveRoomReducer,
  },
});

export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export type RootState = ReturnType<typeof store.getState>

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
