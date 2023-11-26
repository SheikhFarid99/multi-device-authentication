import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { base_url } from '../utils/index'
import Cookies from 'js-cookie';

const LoginHistory = () => {

    const token = localStorage.getItem('user_token')
    const user_token = Cookies.get('user_token')

    const [login_historys, setlogin_historys] = useState([])

    const get_login_history = async () => {

        const config = {
            withcredentials: true,
            headers: {
                Authorization: `Bearer ${token}`
            },

        }

        try {
            const { data } = await axios.get(`${base_url}/api/login/history`, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            setlogin_historys(data.login_historys || [])
        } catch (error) {
            if (error.response?.status === 409) {
                localStorage.removeItem('user_token')
                window.location.href = '/'
            }
            console.log(error)
        }
    }

    useEffect(() => {
        if (token) {
            get_login_history()
        } else {
            window.location.href = '/login'
        }
    }, [token])

    const device = (d) => {
        const temp = d.split(' ')
        return temp[temp.length - 1]
    }

    const logout = async (id) => {

        try {

            try {
                const { data } = await axios.get(`${base_url}/api/anather/user/logout/${id}`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                get_login_history()
            } catch (error) {
                console.log(error)
            }

        } catch (error) {

        }
    }
    return (
        <div className='w-screen min-h-screen flex justify-center items-center bg-slate-200'>
            <div className='w-[90%] bg-white p-4'>
                <div className='flex justify-between items-center'>
                    <h2 className='text-xl font-bold'>Login history</h2>
                    <button className='py-1 px-2 text-white bg-purple-500 rounded-md'>All Logout</button>
                </div>

                <div class="relative overflow-x-auto  p-4">
                    <table class="w-full text-sm text-left rtl:text-right text-gray-500 ">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-5 bg-slate-100">
                            <tr>
                                <th scope="col" class="px-6 py-3">
                                    No
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Ip
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Device
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Time
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                login_historys.map((h, i) => <tr key={i} class="odd:bg-white   border-b ">
                                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap ">
                                        {i + 1}
                                    </th>
                                    <td class="px-6 py-4">
                                        {h.ip}
                                    </td>
                                    <td class="px-6 py-4">
                                        {h.device}
                                    </td>
                                    <td class="px-6 py-4">
                                        {h.time}
                                    </td>
                                    <td class="px-6 py-4">
                                        {
                                            user_token !== h.token ? <span onClick={() => logout(h._id)} class="font-medium text-blue-600 dark:text-blue-500  cursor-pointer">logout</span> : ""
                                        }

                                    </td>
                                </tr>)
                            }

                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    )
}

export default LoginHistory