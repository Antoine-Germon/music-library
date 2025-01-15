
import './App.css'
import GradientBackground from './components/GradientBackground/GradientBackground'

import NavBar from './components/NavBar/NavBar'
import { Outlet } from 'react-router-dom'

function App() {

  return (
    <>
      <NavBar />

      <main>
        <GradientBackground />
        <Outlet />
      </main>
      
      <footer>
        <p>AAAAAAAAAAAAAAAAAAAAAA</p>
      </footer>
    </>
  )
}

export default App
