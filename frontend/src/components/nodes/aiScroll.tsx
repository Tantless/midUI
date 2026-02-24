import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { useNodesStore } from '../../store/nodes';
import type { StepNode } from '../../store/nodes';

type Props = NodeProps<StepNode>;

export const AiScrollNode = memo(({ id, data, selected }: Props) => {
  const updateNode = useNodesStore((state) => state.updateNode);

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(id, {
      data: {
        ...data,
        params: {
          ...data.params,
          target: e.target.value,
        },
      },
    });
  };

  const handleDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNode(id, {
      data: {
        ...data,
        params: {
          ...data.params,
          direction: e.target.value as 'up' | 'down' | 'left' | 'right',
        },
      },
    });
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-3 border-2 w-[170px]
        ${selected ? 'border-cyan-500 ring-2 ring-cyan-200' : 'border-slate-200'}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-cyan-500" />
        <span className="text-sm font-semibold text-slate-700">滚动</span>
      </div>
      <input
        type="text"
        value={data.params.target || ''}
        placeholder="元素选择器（可选）"
        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-cyan-500 mb-2"
        onChange={handleTargetChange}
      />
      <select
        value={data.params.direction || 'down'}
        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-cyan-500"
        onChange={handleDirectionChange}
      >
        <option value="down">向下滚动</option>
        <option value="up">向上滚动</option>
        <option value="left">向左滚动</option>
        <option value="right">向右滚动</option>
      </select>
    </div>
  );
});

AiScrollNode.displayName = 'AiScrollNode';
