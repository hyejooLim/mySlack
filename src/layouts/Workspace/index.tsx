import React, { FC, useCallback, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import useSWR from 'swr';
import axios from 'axios';
import gravatar from 'gravatar';
import { toast } from 'react-toastify';

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
} from './style';
import Menu from '../../components/Menu';
import Modal from '../../components/Modal';
import { IUser, IWorkspace } from '../../types/types';
import { Button, Input, Label } from '../../pages/SignUp/style';
import useInput from '../../hooks/useInput';

const Workspace: FC = ({ children }) => {
  const { data: userData, error, isValidating, mutate } = useSWR<IUser | false>('/api/users', fetcher);

  const [newWorkspace, onChangeNewWorkspace, setNewWorkspace] = useInput<string>('');
  const [newUrl, onChangeNewUrl, setNewUrl] = useInput<string>('');
  const [showUserProfileModal, setShowUserProfileModal] = useState<boolean>(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState<boolean>(false);

  const onClickUserProfile = useCallback(() => {
    setShowUserProfileModal((prev) => !prev);
  }, []);

  const onCloseUserProfileModal = useCallback((e) => {
    e.stopPropagation();

    setShowUserProfileModal(false);
  }, []);

  const onLogOut = useCallback(async () => {
    try {
      await axios.post('/api/users/logout', null, { withCredentials: true });
      mutate();
    } catch (e: any) {
      console.log(e.message);
    }
  }, []);

  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, []);

  const onCloseCreateWorkspaceModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
  }, []);

  const onCreateWorkspace = useCallback(
    async (e) => {
      e.preventDefault();

      if (!newWorkspace || !newWorkspace.trim()) return;
      if (!newUrl || !newUrl.trim()) return;

      try {
        await axios.post('/api/workspaces', { workspace: newWorkspace, url: newUrl }, { withCredentials: true });

        mutate();
        setShowCreateWorkspaceModal(false);
        setNewWorkspace('');
        setNewUrl('');
      } catch (e: any) {
        console.log(e.message);
        toast.error(e.response.data, {
          autoClose: 3000,
          position: 'bottom-left',
        });
      }
    },
    [newWorkspace, newUrl]
  );

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
              <Link key={workspace.id} to={`/workspace/${123}/channel/일반`}>
                <WorkspaceButton>{workspace.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
              </Link>
            );
          })}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
          {showCreateWorkspaceModal && (
            <Modal showModal={showCreateWorkspaceModal} onCloseModal={onCloseCreateWorkspaceModal}>
              <form onSubmit={onCreateWorkspace}>
                <Label id='workspace-name'>
                  <span>워크스페이스 이름</span>
                  <Input type='text' value={newWorkspace} onChange={onChangeNewWorkspace} />
                </Label>
                <Label id='workspace-url'>
                  <span>워크스페이스 URL</span>
                  <Input type='text' value={newUrl} onChange={onChangeNewUrl} />
                </Label>
                <Button type='submit'>생성하기</Button>
              </form>
            </Modal>
          )}
        </Workspaces>
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
