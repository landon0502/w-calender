import { useEffect, useMemo } from 'preact/hooks';
import dayjs from 'dayjs';
import type { CalenderItem } from '@/types/options';
import { isCrossoverTime, isContainTimeRange } from '@/utils/time';
import { arrayGroupByValue } from '@/utils/common';
import { isEmpty, isUndef } from '@/utils/is';
import { useXState } from '@/hooks';
import { TimeValue } from '@wcalender/types/time';

/**
 * @zh 布局配置
 * @en Layout configuration
 */
type CalculateRectReturn = Array<
  CalenderItem & {
    colIndex: number;
  }
>;

/**
 * 获取data column index
 */
function getDataColIdx(
  item: CalenderItem,
  group: {
    totalColumn: number;
    data: CalculateRectReturn;
  }
) {
  let preNextCol = 0;

  let cols = arrayGroupByValue(group.data, 'colIndex').sort((a, b) => {
    return a.groupValue - b.groupValue;
  });
  for (let i = 0; i < cols.length; i++) {
    let { group: col, groupValue: colValue } = cols[i];

    let isCross = col.some(({ start, end }) =>
      isCrossoverTime([item.start, item.end], [start, end])
    );

    if (!isCross) {
      return colValue;
    } else {
      preNextCol += 1;
    }
  }
  return preNextCol;
}

/**
 * @zh 处理数据
 */
function handleGridCols(layoutData: Array<CalenderItem>) {
  // 按时间进行排序
  let data = layoutData.sort((a, b) => {
    return dayjs(a.start.time).isBefore(b.start.time) ? -1 : 1;
  });
  let groups: Array<{
    totalColumn: number;
    data: CalculateRectReturn;
  }> = [];
  data.map((item) => {
    // 获取配置
    const getConfig = (item: CalenderItem, colIndex: number = 0) => {
      return {
        ...item,
        colIndex: colIndex,
      };
    };

    // 获取cols num
    const getColNum = (groupData: CalculateRectReturn) => {
      return Math.max(...groupData.map((item) => item.colIndex)) + 1;
    };

    // 如何为分组为空，则进行添加
    if (isEmpty(groups)) {
      groups.push({
        totalColumn: 1,
        data: [getConfig(item)],
      });
      // 如果存在分组，看是否有两个时间有交叉
    } else {
      let corssGroup = groups.find((group) => {
        return group.data.some((cur) =>
          isCrossoverTime([item.start, item.end], [cur.start, cur.end])
        );
      });

      if (corssGroup) {
        corssGroup.data.push(getConfig(item, getDataColIdx(item, corssGroup)));
        corssGroup.totalColumn = getColNum(corssGroup.data);
      } else {
        groups.push({
          totalColumn: 1,
          data: [getConfig(item)],
        });
      }
    }
  });
  // debugger;
  return groups;
}

export default function useColumnLayout({
  data,
  timeRange,
}: {
  data: CalenderItem[];
  // 限制在当前时间范围
  timeRange?: [TimeValue, TimeValue];
}) {
  const [calenderData, setData, getCalenderData] = useXState<Array<CalenderItem>>([]);

  // 列表布局中数据, 只渲染时间范围内的数据
  const layoutData = useMemo(() => {
    let renderData = isUndef(timeRange)
      ? calenderData
      : (calenderData?.filter((item) =>
          isContainTimeRange([item.start, item.end], timeRange, 'minute', '[)')
        ) ?? []);
    let config = handleGridCols(renderData);
    return config;
  }, [calenderData]);

  useEffect(() => {
    setData(data);
  }, [data]);

  return {
    layoutData,
    calenderData,
    setCalenderData: setData,
    getCalenderData,
  };
}
