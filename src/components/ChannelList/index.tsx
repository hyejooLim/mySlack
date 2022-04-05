import React, { FC, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import { IUser, IChannel, ParamType } from '../../types/types';
import fetcher from '../../utils/fetcher';
import { CollapseButton } from './style';
import EachChannel from '../EachChannel';

const ChannelList: FC = () => {
  const [channelCollapse, setChannelCollapse] = useState<boolean>(false);

  const { workspace, channel } = useParams<ParamType>();
  const { data: userData } = useSWR<IUser>('/api/users', fetcher, { dedupingInterval: 2000 });
  const { data: channelData } = useSWR<IChannel[]>(`/api/workspaces/${workspace}/channels`, fetcher);

  const toggleChannelCollapse = useCallback(() => {
    setChannelCollapse((prev) => !prev);
  }, []);

  return (
    <>
      <h2>
        <CollapseButton collapse={channelCollapse} onClick={toggleChannelCollapse}>
          <i
            className='c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline'
            data-qa='channel-section-collapse'
            aria-hidden='true'
          />
        </CollapseButton>
        <span>Channels</span>
      </h2>
      <div>
        {!channelCollapse &&
          channelData?.map((eachChannel) => {
            const isActive = eachChannel.name === channel;
            return <EachChannel key={eachChannel.id} isActive={isActive} channel={eachChannel} />;
          })}
      </div>
    </>
  );
};

export default ChannelList;
