import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { useNodesStore } from '../../store/nodes';
import type { StepNode } from '../../store/nodes';

type Props = NodeProps<StepNode>;

type ReturnType = 'json' | 'boolean' | 'number' | 'string';

export const AiQueryNode = memo(({ id, data, selected }: Props) => {
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

  const handleReturnTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNode(id, {
      data: {
        ...data,
        params: {
          ...data.params,
          returnType: e.target.value as ReturnType,
        },
      },
    });
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-3 border-2 w-[170px]
        ${selected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-slate-200'}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-orange-500" />
        <span className="text-sm font-semibold text-slate-700">查询</span>
      </div>
      <input
        type="text"
        value={data.params.target || ''}
        placeholder="元素选择器"
        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-orange-500 mb-2"
        onChange={handleTargetChange}
      />
      <select
        value={data.params.returnType || 'json'}
        onChange={handleReturnTypeChange}
        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-orange-500"
      >
        <option value="json">JSON</option>
        <option value="boolean">Boolean</option>
        <option value="number">Number</option>
        <option value="string">String</option>
      </select>
    </div>
  );
});

AiQueryNode.displayName = 'AiQueryNode';
