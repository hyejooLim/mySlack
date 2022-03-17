import React, { FC, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import useSWR from 'swr';
import axios from 'axios';

import fetcher from '../utils/fetcher';

const Workspace: FC = ({ children }) => {
  const { data, error, isValidating, mutate } = useSWR('/api/users', fetcher);

  const onLogOut = useCallback(async () => {
    try {
      await axios.post('/api/users/logout', null, { withCredentials: true });
      mutate();
    } catch (e: any) {
      console.log(e.message);
    }
  }, []);

  if (!data) {
    return <Navigate to={'/login'} />;
  }

  return (
    <div>
      <button onClick={onLogOut}>로그아웃</button>
      {children}
    </div>
  );
};

export default Workspace;
