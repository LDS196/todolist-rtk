import axios from 'axios'

export const instance = axios.create({
	baseURL: 'https://social-network.samuraijs.com/api/1.1/',
	withCredentials: true,
	headers: {
		'API-KEY': '06a76f5c-d1d4-4acf-8b82-4894b111d84f'
	}
})




