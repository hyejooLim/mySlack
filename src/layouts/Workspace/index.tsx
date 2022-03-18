import React, { FC, useCallback, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useSWR from 'swr';
import axios from 'axios';
import gravatar from 'gravatar';

import fetcher from '../../utils/fetcher';
import {
  Header,
  RightMenu,
  ProfileImg,
  ProfileModal,
  LogOutButton,
  WorkspaceWrapper,
  Workspaces,
  Channels,
  WorkspaceName,
  MenuScroll,
  WorkspaceModal,
  Chats,
  AddButton,
  WorkspaceButton,
} from './style';
import Menu from '../../components/Menu';

const Workspace: FC = ({ children }) => {
  const { data, error, isValidating, mutate } = useSWR('/api/users', fetcher);

  const [showModal, setShowModal] = useState<boolean>(false);

  const onClickProfile = useCallback(() => {
    setShowModal((prev) => !prev);
  }, []);

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
      <Header>
        <RightMenu>
          <div onClick={onClickProfile}>
            <ProfileImg src={gravatar.url(data.email, { s: '28px', d: 'retro' })} alt={data.nickname} />
            {showModal && (
              <Menu style={{ right: 0, top: 38 }} showModal={showModal} onCloseModal={onClickProfile}>
                <ProfileModal>
                  <img src={gravatar.url(data.email, { s: '36px', d: 'retro' })} alt={data.nickname} />
                  <div>
                    <span className='profile-name'>{data.nickname}</span>
                    <span className='profile-active'>Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onLogOut}>로그아웃</LogOutButton>
              </Menu>
            )}
          </div>
        </RightMenu>
      </Header>
      <WorkspaceWrapper>
        <Workspaces>workspace</Workspaces>
        <Channels>
          <WorkspaceName>mySlack</WorkspaceName>
          <MenuScroll></MenuScroll>
        </Channels>
        <Chats>{children}</Chats>
      </WorkspaceWrapper>
    </div>
  );
};

export default Workspace;
