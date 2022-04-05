import React, { FC } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import useSWR from 'swr';

import { IUser, ParamType } from '../../types/types';
import fetcher from '../../utils/fetcher';

interface EachDMProps {
  member: IUser;
  isActive: boolean;
  isOnline: boolean;
}

const EachDM: FC<EachDMProps> = ({ member, isActive, isOnline }) => {
  const { workspace } = useParams<ParamType>();
  const date = localStorage.getItem(`${workspace}-${member.id}`) || 0;

  const { data: userData } = useSWR<IUser>('/api/users', fetcher, { dedupingInterval: 2000 });
  const { data: count, mutate } = useSWR<number>(
    userData ? `/api/workspaces/${workspace}/dms/${member.id}/unreads?after=${date}` : null,
    fetcher
  );

  return (
    <NavLink key={member.id} className={isActive ? 'selected' : ''} to={`/workspace/${workspace}/dm/${member.id}`}>
      <i
        className={`c-icon p-channel_sidebar__presence_icon p-channel_sidebar__presence_icon--dim_enabled c-presence ${
          isOnline ? 'c-presence--active c-icon--presence-online' : 'c-icon--presence-offline'
        }`}
        aria-hidden='true'
        data-qa='presence_indicator'
        data-qa-presence-self='false'
        data-qa-presence-active='false'
        data-qa-presence-dnd='false'
      />
      <span className={count !== undefined && count > 0 ? 'bold' : undefined}>
        {member.nickname}
        {member.id === userData?.id ? '(나)' : null}
      </span>
      {count !== undefined && count > 0 && <span className='count'>{count}</span>}
    </NavLink>
  );
};

export default EachDM;
