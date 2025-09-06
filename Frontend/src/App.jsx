import './CSS/App.css'  
import { Routes, Route } from 'react-router-dom'  
import Home from './Pages/Home'
import Favourites from './Pages/Favourites'
import NavBar from './Components/NavBar'
import { MovieProvider } from './context/MovieContext'

function App() {
  return (
    <MovieProvider>
      <main className="App">
        <div>
          <NavBar></NavBar>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/favourites' element={<Favourites/>}/>
          </Routes>
        </div>
      </main>
    </MovieProvider>
  )
}

export default App
