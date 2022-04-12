import React, { CSSProperties, FC } from 'react';

import { CreateMenu, CloseModalButton } from './style';

interface MenuProps {
  style: CSSProperties;
  onCloseModal: (e: any) => void;
}

const Menu: FC<MenuProps> = (props) => {
  const { children, style, onCloseModal } = props;

  return (
    <CreateMenu onClick={onCloseModal}>
      <div style={style} onClick={(e) => e.stopPropagation()}>
        <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
        {children}
      </div>
    </CreateMenu>
  );
};

export default Menu;
