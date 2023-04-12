import {appActions, RequestStatusType} from 'app/app.reducer'
import {AppThunk} from 'app/store';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {clearTasksAndTodolists} from 'common/actions/common.actions';
import {handleServerNetworkError} from 'common/utils/handle-server-network-error';
import {todolistsApi, TodolistType} from 'features/TodolistsList/todolists.api';
import {createAppAsyncThunk} from "common/utils";

const initialState: TodolistDomainType[] = []

export const fetchTodolists = createAppAsyncThunk<{ todolists: TodolistType[] }>
('todo/fetchTodolists', async (_, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await todolistsApi.getTodolists()
        dispatch(appActions.setAppStatus({status: 'succeeded'}))
        return {todolists: res.data}

    } catch (e) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)
    }
})

export const removeTodolist = createAppAsyncThunk<{ id: string }, string>
('todo/removeTodolist', async (id: string, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({status: 'loading'}))
            dispatch(todolistsActions.changeTodolistEntityStatus({id, entityStatus: 'loading'}))
            const res = await todolistsApi.deleteTodolist(id)
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {id}
        } catch
            (e) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    }
)
export const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, string>('todo/addTodolist', async (title: string, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await todolistsApi.createTodolist(title)
        dispatch(appActions.setAppStatus({status: 'succeeded'}))
          return {todolist: res.data.data.item}


    } catch (e) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)
    }
})
export type ChangeTodolistTitleArgsType= {id:string, title:string}
export const changeTodolistTitle =createAppAsyncThunk<ChangeTodolistTitleArgsType,ChangeTodolistTitleArgsType>
('todo/changeTodolistTitle',async (arg, thunkAPI)=>{
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await todolistsApi.updateTodolist(arg.id, arg.title)
        dispatch(appActions.setAppStatus({status: 'succeeded'}))
        return arg
    } catch (e) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)
    }
})

const slice = createSlice({
    name: 'todo',
    initialState,
    reducers: {
        changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
            const todo = state.find(todo => todo.id === action.payload.id)
            if (todo) {
                todo.filter = action.payload.filter
            }
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, entityStatus: RequestStatusType }>) => {
            const todo = state.find(todo => todo.id === action.payload.id)
            if (todo) {
                todo.entityStatus = action.payload.entityStatus
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(clearTasksAndTodolists, () => {
                return []
            })
            .addCase(fetchTodolists.fulfilled, (state, action) => {
                return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
            })
            .addCase(removeTodolist.fulfilled, (state, action) => {
                const index = state.findIndex(todo => todo.id === action.payload.id)
                if (index !== -1) state.splice(index, 1)
            })
            .addCase(addTodolist.fulfilled, (state, action) => {
                const newTodolist: TodolistDomainType = {
                    ...action.payload.todolist,
                    filter: 'all',
                    entityStatus: 'idle'
                }
                state.unshift(newTodolist)
            })
            .addCase(changeTodolistTitle.fulfilled, (state, action) => {
                const todo = state.find(todo => todo.id === action.payload.id)
                    if (todo) {
                        todo.title = action.payload.title
                    }
            })
    }
})
export const todolistsThunk = {fetchTodolists, removeTodolist,addTodolist,changeTodolistTitle}
export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions



// types
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
