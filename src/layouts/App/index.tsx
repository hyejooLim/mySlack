import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import loadable from '@loadable/component';

const LogIn = loadable(() => import('../../pages/LogIn'));
const SignUp = loadable(() => import('../../pages/SignUp'));
const Channel = loadable(() => import('../../pages/Channel'));
const DirectMessage = loadable(() => import('../../pages/DirectMessage'));

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LogIn />} />
        <Route path='/login' element={<LogIn />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/workspace/channel' element={<Channel />} />
        <Route path='/workspace/dm' element={<DirectMessage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
