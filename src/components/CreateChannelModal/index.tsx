import React, { Dispatch, FC, SetStateAction, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import axios from 'axios';
import { toast } from 'react-toastify';

import fetcher from '../../utils/fetcher';
import Modal from '../Modal';
import useInput from '../../hooks/useInput';
import { Label, Input, Button } from '../../pages/SignUp/style';
import { IUser, ParamType, IChannel } from '../../types/types';

interface CreateChannelModalProps {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  onCloseModal: () => void;
}

const CreateChannelModal: FC<CreateChannelModalProps> = ({ setShowModal, onCloseModal }) => {
  const [newChannel, onChangeNewChannel, setNewChannel] = useInput<string>('');

  const { workspace, channel } = useParams<ParamType>();
  const { data: userData } = useSWR<IUser>('/api/users', fetcher, { dedupingInterval: 2000 });
  const { data: channelData, mutate } = useSWR<IChannel[]>(
    userData ? `/api/workspaces/${workspace}/channels` : null,
    fetcher
  );

  const onCreateChannel = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        await axios.post(`/api/workspaces/${workspace}/channels`, { name: newChannel }, { withCredentials: true });
        mutate();
        setShowModal(false);
        setNewChannel('');
      } catch (e: any) {
        console.log(e.message);
        toast.error(e.response.data, {
          autoClose: 3000,
          position: 'bottom-left',
        });
      }
    },
    [newChannel]
  );

  return (
    <Modal onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id='channel-name'>
          <span>채널 이름</span>
          <Input type='text' value={newChannel} onChange={onChangeNewChannel} />
        </Label>
        <Button type='submit'>생성하기</Button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;
