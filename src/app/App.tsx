import React, { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import {
	AppBar,
	Button,
	CircularProgress,
	Container,
	IconButton,
	LinearProgress,
	Toolbar,
	Typography
} from '@mui/material';
import { Menu } from '@mui/icons-material'
import { Login } from 'features/auth/Login'
import {authThunk,} from 'features/auth/auth.reducer'
import './App.css'
import { TodolistsList } from 'features/TodolistsList/TodolistsList'
import { ErrorSnackbar } from 'common/components'
import { selectIsLoggedIn } from 'features/auth/auth.selectors';
import { selectAppStatus, selectIsInitialized } from 'app/app.selectors';

import {useActions} from "common/hooks/useActions";

function App() {
	const status = useSelector(selectAppStatus)
	const isInitialized = useSelector(selectIsInitialized)
	const isLoggedIn = useSelector(selectIsLoggedIn)

	const {initializeApp,logout} = useActions(authThunk)

	useEffect(() => {
		initializeApp()
	}, [])

	const logoutHandler = () => logout()

	if (!isInitialized) {
		return <div
			style={{position: 'fixed', top: '30%', textAlign: 'center', width: '100%'}}>
			<CircularProgress/>
		</div>
	}

	return (
		<BrowserRouter>
			<div className="App">
				<ErrorSnackbar/>
				<AppBar position="static">
					<Toolbar style={{display:"flex",justifyContent: 'space-between'}}>
						<IconButton edge="start" color="inherit" aria-label="menu">
							<Menu/>
						</IconButton>
						{isLoggedIn && <Button color="inherit" onClick={logoutHandler}>Log out</Button>}
					</Toolbar>
					{status === 'loading' && <LinearProgress/>}
				</AppBar>
				<Container fixed>
					<Routes>
						<Route path={'/'} element={<TodolistsList />}/>
						<Route path={'/login'} element={<Login/>}/>
					</Routes>
				</Container>
			</div>
		</BrowserRouter>
	)
}

export default App
