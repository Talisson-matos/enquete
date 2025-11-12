import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import App from './App.tsx'
import Generator from './pages/Generator.tsx'
import './index.css'



createRoot(document.getElementById('root')!).render(
<React.StrictMode>
   <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/generator" element={<Generator />} />
    </Routes>
  </BrowserRouter>,
</React.StrictMode>
)