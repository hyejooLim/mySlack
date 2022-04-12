import React, { FC, Dispatch, SetStateAction, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import useSWR from 'swr';
import { toast } from 'react-toastify';

import useInput from '../../hooks/useInput';
import Modal from '../Modal';
import { Label, Input, Button } from '../../pages/SignUp/style';
import { ParamType, IUser } from '../../types/types';
import fetcher from '../../utils/fetcher';

interface InviteToWorkspaceModalProps {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  onCloseModal: () => void;
}

const InviteToWorkspaceModal: FC<InviteToWorkspaceModalProps> = ({ setShowModal, onCloseModal }) => {
  const [memberEmail, onChangeMemberEmail, setMemberEmail] = useInput<string>('');
  const { workspace } = useParams<ParamType>();

  const { data: userData } = useSWR<IUser>('/api/users', fetcher, { dedupingInterval: 2000 });
  const { data: MemberData, mutate } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
    fetcher
  );

  const onInviteToWorkspace = useCallback(
    async (e) => {
      e.preventDefault();

      if (!memberEmail || !memberEmail.trim()) return;

      try {
        await axios.post(`/api/workspaces/${workspace}/members`, { email: memberEmail }, { withCredentials: true });
        mutate();
        setShowModal(false);
        setMemberEmail('');
      } catch (e: any) {
        console.log(e.message);
        toast.error(e.response.data, {
          autoClose: 3000,
          position: 'bottom-left',
        });
      }
    },
    [memberEmail]
  );

  return (
    <Modal onCloseModal={onCloseModal}>
      <form onSubmit={onInviteToWorkspace}>
        <Label id='member-email'>
          <span>초대 멤버 이메일</span>
          <Input type='text' value={memberEmail} onChange={onChangeMemberEmail} />
        </Label>
        <Button type='submit'>초대하기</Button>
      </form>
    </Modal>
  );
};

export default InviteToWorkspaceModal;
