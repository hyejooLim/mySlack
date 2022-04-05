import React, { FC, useEffect } from 'react';
import { useParams, NavLink, useLocation } from 'react-router-dom';
import useSWR from 'swr';

import { IChannel, IUser, ParamType } from '../../types/types';
import fetcher from '../../utils/fetcher';

interface EachChannelProps {
  channel: IChannel;
  isActive: boolean;
}

const EachChannel: FC<EachChannelProps> = ({ channel, isActive }) => {
  const { workspace } = useParams<ParamType>();
  const date = localStorage.getItem(`${workspace}-${channel.name}`) || 0;

  const { data: userData } = useSWR<IUser>('/api/users', fetcher, { dedupingInterval: 2000 });
  const { data: count, mutate } = useSWR<number>(
    userData ? `/api/workspaces/${workspace}/channels/${channel.name}/unreads?after=${date}` : null,
    fetcher
  );

  const location = useLocation();

  useEffect(() => {
    if (decodeURI(location.pathname) === `/workspace/${workspace}/channel/${channel.name}`) {
      mutate(0);
    }
  }, [location.pathname, workspace, channel, mutate]);

  return (
    <NavLink
      key={channel.id}
      className={isActive ? 'selected' : ''}
      to={`/workspace/${workspace}/channel/${channel.name}`}
    >
      <span className={count !== undefined && count > 0 ? 'bold' : undefined}># {channel.name}</span>
      {count !== undefined && count > 0 && <span className='count'>{count}</span>}
    </NavLink>
  );
};

export default EachChannel;
