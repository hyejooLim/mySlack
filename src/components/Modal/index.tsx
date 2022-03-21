import React, { FC } from 'react';
import { CloseModalButton, CreateModal } from './style';

interface ModalProps {
  showModal: boolean;
  onCloseModal: () => void;
}

const Modal: FC<ModalProps> = (props) => {
  const { onCloseModal, children } = props;

  return (
    <CreateModal onClick={onCloseModal}>
      <div onClick={(e) => e.stopPropagation()}>
        <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
        {children}
      </div>
    </CreateModal>
  );
};

export default Modal;
