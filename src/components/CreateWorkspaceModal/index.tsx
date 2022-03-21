import React, { Dispatch, FC, SetStateAction, useCallback } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { toast } from 'react-toastify';

import { IUser } from '../../types/types';
import fetcher from '../../utils/fetcher';
import useInput from '../../hooks/useInput';
import Modal from '../Modal';
import { Label, Input, Button } from '../../pages/SignUp/style';

interface CreateWorkspaceModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  onCloseModal: () => void;
}

const CreateWorkspaceModal: FC<CreateWorkspaceModalProps> = (props) => {
  const [newWorkspace, onChangeNewWorkspace, setNewWorkspace] = useInput<string>('');
  const [newUrl, onChangeNewUrl, setNewUrl] = useInput<string>('');
  const { data: userData, mutate } = useSWR<IUser | false>('/api/users', fetcher);

  const { showModal, setShowModal, onCloseModal } = props;

  const onCreateWorkspace = useCallback(
    async (e) => {
      e.preventDefault();

      if (!newWorkspace || !newWorkspace.trim()) return;
      if (!newUrl || !newUrl.trim()) return;

      try {
        await axios.post('/api/workspaces', { workspace: newWorkspace, url: newUrl }, { withCredentials: true });
        mutate();
        setShowModal(false);
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

  return (
    <Modal showModal={showModal} onCloseModal={onCloseModal}>
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
  );
};

export default CreateWorkspaceModal;
