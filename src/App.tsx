
import './App.css'

import NavBar from './components/NavBar/NavBar'
import { Outlet } from 'react-router-dom'

function App() {

  return (
    <>
      <NavBar />

      <main>
        <Outlet />
      </main>
      
      <footer>
        <p>AAAAAAAAAAAAAAAAAAAAAA</p>
      </footer>
    </>
  )
}

export default App
