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

interface InviteToChannelModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  onCloseModal: () => void;
}

const InviteToChannelModal: FC<InviteToChannelModalProps> = (props) => {
  const [memberEmail, onChangeMemberEmail, setMemberEmail] = useInput<string>('');
  const { workspace, channel } = useParams<ParamType>();

  const { data: userData } = useSWR<IUser>('/api/users', fetcher, { dedupingInterval: 2000 });
  const { data: MemberData, mutate } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher
  );

  const { showModal, setShowModal, onCloseModal } = props;

  const onInviteToChannel = useCallback(
    async (e) => {
      e.preventDefault();

      if (!memberEmail || !memberEmail.trim()) return;

      try {
        await axios.post(
          `/api/workspaces/${workspace}/channels/${channel}/members`,
          { email: memberEmail },
          { withCredentials: true }
        );
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
    <Modal showModal={showModal} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteToChannel}>
        <Label id='member-email'>
          <span>초대 멤버 이메일</span>
          <Input type='text' value={memberEmail} onChange={onChangeMemberEmail} />
        </Label>
        <Button type='submit'>초대하기</Button>
      </form>
    </Modal>
  );
};

export default InviteToChannelModal;
