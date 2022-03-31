import { IChannelChat } from './../types/types';
import dayjs from 'dayjs';
import { IDMChat } from '../types/types';

export type ChatType = IDMChat | IChannelChat;

export default function makeSections(chatData: ChatType[]) {
  const sections: { [key: string]: ChatType[] } = {};

  chatData.forEach((chat) => {
    const date = dayjs(chat.createdAt).format('YYYY-MM-DD');

    if (date in sections) {
      sections[date].push(chat);
    } else {
      sections[date] = [chat];
    }
  });

  return sections;
}
