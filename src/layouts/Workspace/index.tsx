import React, { FC, useCallback, useState } from 'react';
import { Navigate, Link, useParams } from 'react-router-dom';
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
  Chats,
  AddButton,
  WorkspaceButton,
  WorkspaceModal,
} from './style';
import Menu from '../../components/Menu';
import { ParamType, IChannel, IUser, IWorkspace } from '../../types/types';
import CreateChannelModal from '../../components/CreateChannelModal';
import CreateWorkspaceModal from '../../components/CreateWorkspaceModal';
import InviteToWorkspaceModal from '../../components/InviteToWorkspaceModal';
import InviteToChannelModal from '../../components/InviteToChannelModal';

const Workspace: FC = ({ children }) => {
  const [showUserProfileModal, setShowUserProfileModal] = useState<boolean>(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState<boolean>(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState<boolean>(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState<boolean>(false);
  const [showInviteToWorkspaceModal, setShowInviteToWorkspaceModal] = useState<boolean>(false);
  const [showInviteToChannelModal, setShowInviteToChannelModal] = useState<boolean>(false);

  const { workspace, channel } = useParams<ParamType>();

  const { data: userData, mutate } = useSWR<IUser | false>('/api/users', fetcher);
  const { data: channelData } = useSWR<IChannel[]>(userData ? `/api/workspaces/${workspace}/channels` : null, fetcher);

  const onLogOut = useCallback(async () => {
    try {
      await axios.post('/api/users/logout', null, { withCredentials: true });
      mutate();
    } catch (e: any) {
      console.log(e.message);
    }
  }, []);

  const onClickUserProfile = useCallback(() => {
    setShowUserProfileModal((prev) => !prev);
  }, []);

  const onCloseUserProfileModal = useCallback((e) => {
    e.stopPropagation();

    setShowUserProfileModal(false);
  }, []);

  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, []);

  const onCloseCreateWorkspaceModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
  }, []);

  const onToggleWorkspaceModal = useCallback(() => {
    setShowWorkspaceModal((prev) => !prev);
  }, []);

  const onClickCreateChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);

  const onCloseCreateChannelModal = useCallback(() => {
    setShowCreateChannelModal(false);
  }, []);

  const onClickInviteToWorkspace = useCallback(() => {
    setShowInviteToWorkspaceModal(true);
  }, []);

  const onCloseInviteToWorkspaceModal = useCallback(() => {
    setShowInviteToWorkspaceModal(false);
  }, []);

  const onCloseInviteToChannelModal = useCallback(() => {
    setShowInviteToChannelModal(false);
  }, []);

  if (!userData) {
    return <Navigate to={'/login'} />;
  }

  return (
    <div>
      <Header>
        <RightMenu>
          <div onClick={onClickUserProfile}>
            <ProfileImg src={gravatar.url(userData.email, { s: '28px', d: 'retro' })} alt={userData.nickname} />
            {showUserProfileModal && (
              <Menu
                style={{ right: 0, top: 38 }}
                showModal={showUserProfileModal}
                onCloseModal={onCloseUserProfileModal}
              >
                <ProfileModal>
                  <img src={gravatar.url(userData.email, { s: '36px', d: 'retro' })} alt={userData.nickname} />
                  <div>
                    <span className='profile-name'>{userData.nickname}</span>
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
        <Workspaces>
          {userData.Workspaces.map((workspace: IWorkspace) => {
            return (
              <Link key={workspace.id} to={`/workspace/${workspace.url}/channel/일반`}>
                <WorkspaceButton>{workspace.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
              </Link>
            );
          })}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
          {showCreateWorkspaceModal && (
            <CreateWorkspaceModal
              showModal={showCreateWorkspaceModal}
              setShowModal={setShowCreateWorkspaceModal}
              onCloseModal={onCloseCreateWorkspaceModal}
            />
          )}
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={onToggleWorkspaceModal}>
            {userData.Workspaces.find((ws) => ws.url === workspace)?.name}
          </WorkspaceName>
          <MenuScroll>
            {channelData?.map((channel) => (
              <div key={channel.id}>{channel.name}</div>
            ))}
            {showWorkspaceModal && (
              <Menu style={{ top: 100, left: 80 }} showModal={showWorkspaceModal} onCloseModal={onToggleWorkspaceModal}>
                <WorkspaceModal>
                  <h2>{userData.Workspaces.find((ws) => ws.url === workspace)?.name}</h2>
                  <button onClick={onClickInviteToWorkspace}>워크스페이스에 사용자 초대하기</button>
                  <button onClick={onClickCreateChannel}>채널 만들기</button>
                  <button onClick={onLogOut}>로그아웃</button>
                </WorkspaceModal>
              </Menu>
            )}
          </MenuScroll>
        </Channels>
        <Chats>{children}</Chats>
      </WorkspaceWrapper>
      {showCreateChannelModal && (
        <CreateChannelModal
          showModal={showCreateChannelModal}
          setShowModal={setShowCreateChannelModal}
          onCloseModal={onCloseCreateChannelModal}
        />
      )}
      {showInviteToWorkspaceModal && (
        <InviteToWorkspaceModal
          showModal={showInviteToWorkspaceModal}
          setShowModal={setShowInviteToWorkspaceModal}
          onCloseModal={onCloseInviteToWorkspaceModal}
        />
      )}
      {showInviteToChannelModal && (
        <InviteToChannelModal
          showModal={showInviteToChannelModal}
          setShowModal={setShowInviteToChannelModal}
          onCloseModal={onCloseInviteToChannelModal}
        />
      )}
    </div>
  );
};

export default Workspace;
