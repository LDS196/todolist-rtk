import {todolistsAPI, TodolistType} from 'api/todolists-api'
import {Dispatch} from 'redux'
import {appActions, RequestStatusType} from 'app/app-reducer'
import {handleServerNetworkError} from 'utils/error-utils'
import {AppThunk} from 'app/store';
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {clearTasksAndTodolists} from "common/common.actions";

const initialState: Array<TodolistDomainType> = []
const slice = createSlice({
    name: 'todo',
    initialState,
    reducers: {
        removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index > -1) state.splice(index, 1)
        },
        addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
            const newTodo: TodolistDomainType = {...action.payload.todolist, filter: 'all', entityStatus: 'idle'}
            state.unshift(newTodo)
        },
        changeTodolistTitle: (state, action: PayloadAction<{ id: string, title: string }>) => {
            const todo = state.find(todo => todo.id === action.payload.id)
            if (todo) todo.title = action.payload.title
        },
        changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
            const todo = state.find(todo => todo.id === action.payload.id)
            if (todo) todo.filter = action.payload.filter
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, status: RequestStatusType }>) => {
            const todo = state.find(todo => todo.id === action.payload.id)
            if (todo) todo.entityStatus = action.payload.status
        },
        setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        },
    },
    extraReducers: builder => {
        builder
            .addCase(clearTasksAndTodolists,(state, action)=>{
                return action.payload.todolists
            })
    }
})
export const todolistsReducer = slice.reducer
export const todolistActions = slice.actions


// thunks
export const fetchTodolistsTC = (): AppThunk => {
    return (dispatch) => {

        dispatch(appActions.setAppStatus({status: 'loading'}))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(todolistActions.setTodolists({todolists:res.data}))
                dispatch(appActions.setAppStatus({status: 'succeeded'}))
            })
            .catch(error => {
                handleServerNetworkError(error, dispatch);
            })
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: any) => {
        //изменим глобальный статус приложения, чтобы вверху полоса побежала
        dispatch(appActions.setAppStatus({status: 'loading'}))
        //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо

        dispatch(todolistActions.changeTodolistEntityStatus({id:todolistId, status:'loading'}))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                dispatch(todolistActions.removeTodolist({id:todolistId}))
                //скажем глобально приложению, что асинхронная операция завершена
                dispatch(appActions.setAppStatus({status: 'succeeded'}))
            })
    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: any) => {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        todolistsAPI.createTodolist(title)
            .then((res) => {

                dispatch(todolistActions.addTodolist({todolist:res.data.data.item}))
                dispatch(appActions.setAppStatus({status: 'succeeded'}))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(todolistActions.changeTodolistTitle({title:title,id:id}))
            })
    }
}

// types


export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}

