import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { useNodesStore } from '../../store/nodes';
import type { StepNode } from '../../store/nodes';

type Props = NodeProps<StepNode>;

export const AiNumberNode = memo(({ id, data, selected }: Props) => {
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

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-3 border-2 w-[170px]
        ${selected ? 'border-teal-500 ring-2 ring-teal-200' : 'border-slate-200'}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-teal-500" />
        <span className="text-sm font-semibold text-slate-700">数字</span>
      </div>
      <input
        type="text"
        value={data.params.target || ''}
        placeholder="元素选择器"
        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-teal-500"
        onChange={handleTargetChange}
      />
      <div className="mt-2 text-xs text-slate-500">
        返回类型: number
      </div>
    </div>
  );
});

AiNumberNode.displayName = 'AiNumberNode';
