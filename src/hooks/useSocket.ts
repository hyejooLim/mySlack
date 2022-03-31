import { useCallback } from 'react';
import io from 'socket.io-client';

const BACK_URL = 'http://localhost:3095';

const sockets: { [key: string]: SocketIOClient.Socket } = {};

type ReturnType = [SocketIOClient.Socket | undefined, () => void];

const useSocket = (workspace: string | undefined): ReturnType => {
  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect(); // 소켓 연결 종료
      delete sockets[workspace];
    }
  }, [workspace]);

  if (!workspace) {
    return [undefined, disconnect];
  }

  // 초기에만 서버와 연결
  if (!sockets[workspace]) {
    sockets[workspace] = io.connect(`${BACK_URL}/ws-${workspace}`, {
      transports: ['websocket'],
    });
  }

  return [sockets[workspace], disconnect];
};

export default useSocket;
