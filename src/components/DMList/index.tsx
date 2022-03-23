import React, { FC, useCallback, useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import useSWR from 'swr';
import useSocket from '../../hooks/useSocket';

import { IUser, ParamType } from '../../types/types';
import fetcher from '../../utils/fetcher';
import { CollapseButton } from '../ChannelList/style';

const DMList: FC = () => {
  const [memberCollapse, setMemberCollapse] = useState<boolean>(false);
  const [onlineList, setOnlineList] = useState<number[]>([]);

  const { workspace, id } = useParams<ParamType>();
  const { data: userData } = useSWR<IUser>('/api/users', fetcher, { dedupingInterval: 2000 });
  const { data: memberData } = useSWR<IUser[]>(userData ? `/api/workspaces/${workspace}/members` : null, fetcher);
  const [socket] = useSocket(workspace);

  useEffect(() => {
    if (socket) {
      socket.on('onlineList', (onlineList: number[]) => {
        setOnlineList(onlineList);
      });
    }

    return () => {
      socket?.off('onlineList');
    };
  }, [socket]);

  const toggleMemberCollapse = useCallback(() => {
    setMemberCollapse((prev) => !prev);
  }, []);

  return (
    <>
      <h2>
        <CollapseButton collapse={memberCollapse} onClick={toggleMemberCollapse}>
          <i
            className='c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline'
            data-qa='channel-section-collapse'
            aria-hidden='true'
          />
        </CollapseButton>
        <span>Direct Messages</span>
      </h2>
      <div>
        {!memberCollapse &&
          memberData?.map((member) => {
            const isActive = member.id === Number(id);
            const isOnline = onlineList.find((item) => item === member.id);

            return (
              <NavLink
                key={member.id}
                className={isActive ? 'selected' : ''}
                to={`/workspace/${workspace}/dm/${member.id}`}
              >
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
                <span>{member.nickname}</span>
                {member.id === userData?.id ? <span> (나)</span> : null}
              </NavLink>
            );
          })}
      </div>
    </>
  );
};

export default DMList;
