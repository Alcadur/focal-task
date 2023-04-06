import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ShelvesMarkers } from './components/ShelvesMarkers';
import { ShelveType } from './models/types';

function App() {
  const imageUrl = '/test-shelves.jpg'

  function onShelvesChange(shelves: ShelveType[]) {
    console.log('shelves: ', shelves)
  }

  return (
    <div className="App">
      <ShelvesMarkers imageUrl={imageUrl} shelves={[[140, 180], [289, 325]]} onChange={onShelvesChange} />
    </div>
  )
}

export default App
