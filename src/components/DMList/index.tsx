import React, { FC, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import useSocket from '../../hooks/useSocket';

import { IUser, ParamType } from '../../types/types';
import fetcher from '../../utils/fetcher';
import { CollapseButton } from '../ChannelList/style';
import EachDM from '../EachDM';

const DMList: FC = () => {
  const [memberCollapse, setMemberCollapse] = useState<boolean>(false);
  const [onlineList, setOnlineList] = useState<number[]>([]);

  const { workspace, id } = useParams<ParamType>();
  const { data: userData } = useSWR<IUser>('/api/users', fetcher, { dedupingInterval: 2000 });
  const { data: memberData } = useSWR<IUser[]>(userData ? `/api/workspaces/${workspace}/members` : null, fetcher);
  const [socket] = useSocket(workspace);

  useEffect(() => {
    socket?.on('onlineList', (onlineList: number[]) => {
      setOnlineList(onlineList);
    });

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
            const isOnline = onlineList.includes(member.id);

            return <EachDM key={member.id} member={member} isActive={isActive} isOnline={isOnline} />;
          })}
      </div>
    </>
  );
};

export default DMList;
