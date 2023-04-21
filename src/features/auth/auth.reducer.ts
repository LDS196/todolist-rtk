import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from 'app/store';
import { appActions } from 'app/app.reducer';
import { authAPI, LoginParamsType } from 'features/auth/auth.api';
import { clearTasksAndTodolists } from 'common/actions';
import {createAppAsyncThunk, handleServerAppError, handleServerNetworkError} from 'common/utils';

const initializeApp = createAppAsyncThunk<{ isLoggedIn: boolean }, void>
('app/initializeApp', async (_, thunkAPI) => {
	const {dispatch, rejectWithValue} = thunkAPI
	try {
		const res = await authAPI.me()
		if (res.data.resultCode === 0) {
			return {isLoggedIn: true}
		} else {
			return rejectWithValue(null)
		}
	} catch (e) {
		handleServerNetworkError(e, dispatch)
		return rejectWithValue(null)
	} finally {
		dispatch(appActions.setAppInitialized({isInitialized: true}));
	}
})
const login = createAppAsyncThunk<{isLoggedIn: boolean}, LoginParamsType>
('auth/login', async (arg, thunkAPI) => {
	const {dispatch, rejectWithValue} = thunkAPI
	try {
		dispatch(appActions.setAppStatus({status: 'loading'}))
		const res = await authAPI.login(arg)
		if (res.data.resultCode === 0) {
			dispatch(appActions.setAppStatus({status: 'succeeded'}))
			return {isLoggedIn: true}
		} else {
			const isShowAppError = !res.data.fieldsErrors.length
			 handleServerAppError(res.data, dispatch,isShowAppError)
			return rejectWithValue(res.data)
		}
	} catch (e) {
		handleServerNetworkError(e, dispatch)
		return rejectWithValue(null)
	}
})

const logout = createAppAsyncThunk<{isLoggedIn: boolean}, void>
('auth/logout', async (_, thunkAPI) => {
	const {dispatch, rejectWithValue} = thunkAPI
	try {
		dispatch(appActions.setAppStatus({status: 'loading'}))
		const res = await authAPI.logout()
		if (res.data.resultCode === 0) {
			dispatch(clearTasksAndTodolists())
			dispatch(appActions.setAppStatus({status: 'succeeded'}))
			return {isLoggedIn: false}
		} else {
			handleServerAppError(res.data, dispatch)
			return rejectWithValue(null)
		}
	} catch (e) {
		handleServerNetworkError(e, dispatch)
		return rejectWithValue(null)
	}
})

const slice = createSlice({
	name: 'auth',
	initialState: {
		isLoggedIn: false
	},
	reducers: {
		setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
			state.isLoggedIn = action.payload.isLoggedIn
		},

	},
	extraReducers: builder => {
		builder
			.addCase(login.fulfilled, (state, action) => {
				state.isLoggedIn = action.payload.isLoggedIn
			})
			.addCase(logout.fulfilled, (state, action) => {
				state.isLoggedIn = action.payload.isLoggedIn
			})
	}
})

export const authReducer = slice.reducer
export const authActions = slice.actions
export const authThunk = {login,logout,initializeApp}


// thunks
// export const loginTC = (data: LoginParamsType): AppThunk => (dispatch) => {
// 	dispatch(appActions.setAppStatus({status: 'loading'}))
// 	authAPI.login(data)
// 		.then(res => {
// 			if (res.data.resultCode === 0) {
// 				dispatch(authActions.setIsLoggedIn({isLoggedIn: true}))
// 				dispatch(appActions.setAppStatus({status: 'succeeded'}))
// 			} else {
// 				handleServerAppError(res.data, dispatch)
// 			}
// 		})
// 		.catch((error) => {
// 			handleServerNetworkError(error, dispatch)
// 		})
// }

export const logoutTC = (): AppThunk => (dispatch) => {
	dispatch(appActions.setAppStatus({status: 'loading'}))
	authAPI.logout()
		.then(res => {
				if (res.data.resultCode === 0) {
					dispatch(authActions.setIsLoggedIn({isLoggedIn: false}))
					dispatch(clearTasksAndTodolists())
					dispatch(appActions.setAppStatus({status: 'succeeded'}))
				} else {
					handleServerAppError(res.data, dispatch)
				}
			}
		)
		.catch((error) => {
			handleServerNetworkError(error, dispatch)
		})
}

