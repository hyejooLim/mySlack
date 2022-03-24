import dayjs from 'dayjs';
import { IDMChat } from '../types/types';

export default function makeSections(chatData: IDMChat[]) {
  const sections: { [key: string]: IDMChat[] } = {};

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
