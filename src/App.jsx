import { useState, useEffect } from 'react'
import './index.css'
import Header from './components/Header'
import Hero from './components/Hero'
import SearchBox from './components/SearchBox'
import LiveTrace from './components/LiveTrace'
import FeaturesGrid from './components/FeaturesGrid'

function App() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.body.className = theme
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="container min-h-screen py-6">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <SearchBox />
      <LiveTrace />
      <FeaturesGrid />
      <div className="font-display text-3xl md:text-5xl text-center mt-12 mb-12 opacity-85">
        ship-ready insights, <span className="text-grad">on every scroll.</span>
      </div>
    </div>
  )
}

export default App
