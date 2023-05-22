import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GameManager from './pages/GameManager';
import { slice } from './useStore';
import './App.scss';

const store = configureStore({ reducer: slice.reducer });
function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GameManager />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
