import ChCalender from 'w-calender';
import type { Options } from 'w-calender/types';
import dayjs from 'dayjs';

import 'w-calender/dist/w-calender.css';
function main() {
  const viewType = document.getElementById('pet-select') as HTMLSelectElement;
  const options: Options = {
    data: [
      {
        start: dayjs().add(1, 'day').format('YYYY-MM-DD 00:00'),
        end: dayjs().add(1, 'day').format('YYYY-MM-DD 4:00'),
        title: '这里是测试1',
      },
      {
        start: dayjs().format('YYYY-MM-DD 8:00'),
        end: dayjs().format('YYYY-MM-DD 11:00'),
        title: '这里是测试2',
      },
      {
        start: dayjs().format('YYYY-MM-DD 8:00'),
        end: dayjs().format('YYYY-MM-DD 11:00'),
        title: '这里是测试---',
      },
      {
        start: dayjs().format('YYYY-MM-DD 00:00'),
        end: dayjs().format('YYYY-MM-DD 23:59'),
        title: '这里是测试3',
      },
      {
        start: dayjs().format('YYYY-MM-DD 12:00'),
        end: dayjs().format('YYYY-MM-DD 14:00'),
        title: '这里是测试4',
      },

      {
        start: dayjs().format('YYYY-MM-DD 13:00'),
        end: dayjs().format('YYYY-MM-DD 15:00'),
        title: '这里是测试6',
      },
      {
        start: dayjs().format('YYYY-MM-DD 12:00'),
        end: dayjs().format('YYYY-MM-DD 14:00'),
        title: '这里是测试5',
      },
      {
        start: dayjs().format('YYYY-MM-DD 15:30'),
        end: dayjs().format('YYYY-MM-DD 16:50'),
        title: '这里是测试7',
      },
      {
        start: dayjs().format('YYYY-MM-DD 14:10'),
        end: dayjs().format('YYYY-MM-DD 15:00'),
        title: '这里是测试8',
      },
      {
        start: dayjs().format('YYYY-MM-DD 14:50'),
        end: dayjs().format('YYYY-MM-DD 15:50'),
        title: '这里是测试9',
      },
      {
        start: dayjs().format('YYYY-MM-DD 14:50'),
        end: dayjs().add(1, 'day').format('YYYY-MM-DD 15:50'),
        title: '跨天测试数据',
      },
      {
        start: dayjs().format('YYYY-MM-DD 00:00'),
        end: dayjs().add(1, 'day').format('YYYY-MM-DD 23:59'),
        title: '跨天测试数据2',
      },
      {
        start: dayjs().add(1, 'day').format('YYYY-MM-DD 15:00'),
        end: dayjs().add(4, 'day').format('YYYY-MM-DD 15:00'),
        title: '跨天测试数据4',
      },
      {
        start: dayjs().add(0, 'day').format('YYYY-MM-DD 16:00'),
        end: dayjs().add(3, 'day').format('YYYY-MM-DD 15:00'),
        title: '跨天测试数据4',
      },
    ],
    date: dayjs().format('YYYY-MM-DD'),
    viewType: viewType.value,
    async onBeforeUpdate() {
      return true;
    },
    layoutConfig: {
      columnWidth: 180,
      header: {},
    },
  };

  let context = new ChCalender(document.getElementById('calender-container')!, options);

  viewType?.addEventListener('change', (e) => {
    context.changeView(viewType.value);
  });
}
main();
