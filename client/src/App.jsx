import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pases/Login'
import Register from './pases/Register'
import LoginHistory from './pases/LoginHistory'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginHistory />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
