import {AppRootStateType} from "app/store";

export const authIsLoggedInSelector = (state:AppRootStateType)=> state.auth.isLoggedIn