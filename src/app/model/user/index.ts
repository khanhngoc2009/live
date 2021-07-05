import { GenericListInitialState } from "../../Screen/GetsentryScreen/slice/GenericListInitialState";

export interface User{
    id?:any,
    name?:string,
    email?:string,
    phone_number?:string,
    password?:string,
    role?:any,
    gender?:any,
    status?:number
}
export const initialState: GenericListInitialState<User> = {
    isLoading: false,
    error: null,
    listUser:[],
    data:[],
}
