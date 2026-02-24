import { memo, useCallback, useState, useMemo } from 'react';
import { useNodesStore } from '../store/nodes';
import type { StepNode } from '../store/nodes';

export interface NodeTypeConfig {
  type: 'aiTap' | 'aiInput' | 'aiWaitFor' | 'aiAssert' | 'aiNavigate' | 'aiScroll' | 'aiRightClick' | 'aiDoubleClick' | 'aiReload' | 'aiQuery' | 'aiBoolean' | 'aiNumber' | 'aiString';
  label: string;
  color: string;
}

const BASIC_TYPES: NodeTypeConfig[] = [
  { type: 'aiTap', label: '点击', color: 'bg-blue-500' },
  { type: 'aiInput', label: '输入', color: 'bg-green-500' },
  { type: 'aiWaitFor', label: '等待', color: 'bg-yellow-500' },
  { type: 'aiAssert', label: '断言', color: 'bg-red-500' },
  { type: 'aiNavigate', label: '导航', color: 'bg-purple-500' },
];

const INTERACTION_TYPES: NodeTypeConfig[] = [
  { type: 'aiScroll', label: '滚动', color: 'bg-cyan-500' },
  { type: 'aiRightClick', label: '右键', color: 'bg-blue-600' },
  { type: 'aiDoubleClick', label: '双击', color: 'bg-blue-700' },
  { type: 'aiReload', label: '刷新', color: 'bg-gray-500' },
];

const DATA_EXTRACT_TYPES: NodeTypeConfig[] = [
  { type: 'aiQuery', label: '查询', color: 'bg-orange-500' },
  { type: 'aiBoolean', label: '布尔', color: 'bg-indigo-500' },
  { type: 'aiNumber', label: '数字', color: 'bg-teal-500' },
  { type: 'aiString', label: '文本', color: 'bg-pink-500' },
];

interface NodeHelpParam {
  name: string;
  required: boolean;
  type: string;
  desc: string;
}

interface NodeHelpDetail {
  type: string;
  label: string;
  category: string;
  color: string;
  description: string;
  params: NodeHelpParam[];
  example: string;
  notes: string;
}

const NODE_HELP_DETAIL: NodeHelpDetail[] = [
  {
    type: 'aiTap', label: '点击', category: '基础操作', color: 'blue',
    description: '点击页面上的指定元素。AI会自动识别并点击目标元素，无需编写复杂的CSS选择器或XPath。',
    params: [
      { name: 'target', required: true, type: 'string', desc: '要点击的元素，支持自然语言描述如"提交按钮"或"第一个链接"' }
    ],
    example: '示例1: target="提交按钮"\n示例2: target="登录链接"',
    notes: '• AI会自动滚动到元素可见位置\n• 支持模糊匹配如"第一个按钮"\n• 如果页面有多个匹配元素，会点击第一个'
  },
  {
    type: 'aiInput', label: '输入', category: '基础操作', color: 'green',
    description: '在输入框或文本区域中输入文本内容。AI会自动找到对应的输入框并填入内容。',
    params: [
      { name: 'target', required: true, type: 'string', desc: '输入框元素，支持自然语言如"用户名输入框"或"搜索框"' },
      { name: 'value', required: true, type: 'string', desc: '要输入的文本内容' }
    ],
    example: '示例1: target="用户名输入框"\n示例2: value="测试用户"',
    notes: '• 会先清空输入框再输入内容\n• 支持输入特殊字符、emoji\n• 支持多行文本输入'
  },
  {
    type: 'aiWaitFor', label: '等待', category: '基础操作', color: 'yellow',
    description: '等待指定元素出现在页面中。常用于等待页面加载完成或等待某个动态内容出现。',
    params: [
      { name: 'target', required: true, type: 'string', desc: '要等待出现的元素，如"加载动画"或"确认弹窗"' },
      { name: 'timeout', required: false, type: 'number', desc: '超时时间，单位毫秒，默认10000ms（10秒）' }
    ],
    example: '示例1: target="加载动画"\n示例2: timeout=30000',
    notes: '• 等待元素出现后立即继续执行\n• 超出超时时间会报错\n• 建议对耗时操作设置较长超时时间'
  },
  {
    type: 'aiAssert', label: '断言', category: '基础操作', color: 'red',
    description: '验证页面元素的内容或状态是否符合预期。用于确认测试结果是否符合预期。',
    params: [
      { name: 'target', required: true, type: 'string', desc: '要验证的元素，如"错误提示"或"成功消息"' },
      { name: 'value', required: true, type: 'string', desc: '期望的值，空值表示验证元素不存在' }
    ],
    example: '示例1: target="错误提示"\n示例2: value="" (验证元素不存在)',
    notes: '• value为空字符串时，验证元素不存在\n• 支持文本内容精确匹配\n• 断言失败会停止测试执行'
  },
  {
    type: 'aiNavigate', label: '导航', category: '基础操作', color: 'purple',
    description: '导航到指定的URL地址。用于打开测试页面的起始URL。',
    params: [
      { name: 'url', required: true, type: 'string', desc: '目标URL地址，支持完整URL或相对路径' }
    ],
    example: 'url="https://example.com/login"',
    notes: '• 会等待页面完全加载后继续执行\n• 支持HTTP和HTTPS协议\n• 相对路径以baseUrl为基准'
  },
  {
    type: 'aiScroll', label: '滚动', category: '交互操作', color: 'cyan',
    description: '滚动页面或元素到指定位置。用于查看页面下方内容或触发懒加载。',
    params: [
      { name: 'target', required: false, type: 'string', desc: '滚动到指定元素（可选），如"页面底部"' },
      { name: 'direction', required: false, type: 'string', desc: '滚动方向：up/down/left/right/top/bottom，不填默认为down' }
    ],
    example: '示例1: direction="bottom" (滚动到页面底部)\n示例2: target="评论区域"',
    notes: '• 不指定target时按direction滚动\n• top滚动到页面顶部，bottom滚动到底部\n• 可用于触发无限滚动加载更多内容'
  },
  {
    type: 'aiRightClick', label: '右键', category: '交互操作', color: 'blue',
    description: '对指定元素执行右键点击操作，触发浏览器的上下文菜单。',
    params: [
      { name: 'target', required: true, type: 'string', desc: '要右键点击的元素，如"文件列表项"' }
    ],
    example: 'target="文件列表项"',
    notes: '• 触发浏览器的原生右键菜单\n• 可用于测试右键菜单功能\n• 可配合其他步骤选择菜单选项'
  },
  {
    type: 'aiDoubleClick', label: '双击', category: '交互操作', color: 'blue',
    description: '对指定元素执行双击操作。',
    params: [
      { name: 'target', required: true, type: 'string', desc: '要双击的元素，如"编辑按钮"' }
    ],
    example: 'target="编辑按钮"',
    notes: '• 常用于进入编辑模式\n• 用于选中文件或文件夹\n• 某些UI需要双击才能触发动作'
  },
  {
    type: 'aiReload', label: '刷新', category: '交互操作', color: 'gray',
    description: '刷新当前页面。重新加载页面内容。',
    params: [],
    example: '（无需参数）',
    notes: '• 等待网络请求完成后继续\n• 会重新执行所有后续步骤\n• 常用于获取最新数据或重置页面状态'
  },
  {
    type: 'aiQuery', label: '查询', category: '数据提取', color: 'orange',
    description: '使用AI能力查询并提取页面上的结构化数据。支持提取JSON、数组等复杂数据结构。',
    params: [
      { name: 'target', required: true, type: 'string', desc: '要提取的数据区域，如"商品列表"或"用户表格"' },
      { name: 'returnType', required: false, type: 'string', desc: '返回数据类型：json/boolean/number/string，默认json' },
      { name: 'query', required: false, type: 'string', desc: 'AI查询指令，用自然语言描述要提取什么' }
    ],
    example: '示例1: target="商品列表"\n示例2: query="提取所有商品名称和价格"\n示例3: returnType="json"',
    notes: '• 支持自然语言查询指令\n• 返回结果可保存到变量供后续使用\n• returnType指定返回的JSON结构'
  },
  {
    type: 'aiBoolean', label: '布尔', category: '数据提取', color: 'indigo',
    description: '提取布尔值，用于判断元素是否存在、是否选中、是否可见等状态。',
    params: [
      { name: 'target', required: true, type: 'string', desc: '要检查的元素或状态描述，如"登录按钮是否可见"' }
    ],
    example: '示例1: target="登录按钮是否可见"\n示例2: 返回 true / false',
    notes: '• 返回true或false的布尔值\n• 常用于条件判断分支\n• 常见场景：登录状态、勾选状态、元素可见性'
  },
  {
    type: 'aiNumber', label: '数字', category: '数据提取', color: 'teal',
    description: '提取页面上的数字，如价格、数量、排名、评分等数值内容。',
    params: [
      { name: 'target', required: true, type: 'string', desc: '包含数字的元素，如"商品价格"或"用户数量"' }
    ],
    example: 'target="商品价格"',
    notes: '• 自动提取元素中的数字部分\n• 支持价格、评分、销量等数值\n• 返回纯数字便于后续计算比对'
  },
  {
    type: 'aiString', label: '文本', category: '数据提取', color: 'pink',
    description: '提取页面上的文本内容，如标题、用户名、描述等文字信息。',
    params: [
      { name: 'target', required: true, type: 'string', desc: '要提取的文本元素，如"文章标题"或"用户名"' }
    ],
    example: 'target="文章标题"',
    notes: '• 返回纯文本内容\n• 自动去除多余空白字符\n• 支持提取任意文本信息'
  }
];

export const NodeToolbar = memo(() => {
  const addNode = useNodesStore((state) => state.addNode);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const categories = useMemo(() => {
    const groups: Record<string, NodeHelpDetail[]> = {};
    NODE_HELP_DETAIL.forEach((node) => {
      if (!groups[node.category]) {
        groups[node.category] = [];
      }
      groups[node.category].push(node);
    });
    return groups;
  }, []);

  const currentNode = useMemo(() => {
    return NODE_HELP_DETAIL.find((n) => n.type === selectedNode);
  }, [selectedNode]);

  const handleClick = useCallback(
    (nodeType: NodeTypeConfig['type']) => {
      const newNode: StepNode = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position: { x: 250, y: 100 },
        data: {
          label: nodeType,
          params: {},
        },
      };
      addNode(newNode);
    },
    [addNode]
  );

  return (
    <div className="relative">
      <div className="flex gap-2 p-4 bg-white border border-slate-200 rounded-xl">
        {/* 基础操作 */}
        <div className="flex gap-2">
          {BASIC_TYPES.map((nodeType) => (
            <div
              key={nodeType.type}
              onClick={() => handleClick(nodeType.type)}
              className="group flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-white cursor-pointer hover:shadow-md active:scale-95"
            >
              <div className={`w-3 h-3 rounded-full ${nodeType.color}`} />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                {nodeType.label}
              </span>
            </div>
          ))}
        </div>

        {/* 分隔线 */}
        <div className="w-px h-10 bg-slate-300 mx-1 self-center" />

        {/* 交互操作 */}
        <div className="flex gap-2">
          {INTERACTION_TYPES.map((nodeType) => (
            <div
              key={nodeType.type}
              onClick={() => handleClick(nodeType.type)}
              className="group flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-white cursor-pointer hover:shadow-md active:scale-95"
            >
              <div className={`w-3 h-3 rounded-full ${nodeType.color}`} />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                {nodeType.label}
              </span>
            </div>
          ))}
        </div>

        {/* 分隔线 */}
        <div className="w-px h-10 bg-slate-300 mx-1 self-center" />

        {/* 数据提取 */}
        <div className="flex gap-2">
          {DATA_EXTRACT_TYPES.map((nodeType) => (
            <div
              key={nodeType.type}
              onClick={() => handleClick(nodeType.type)}
              className="group flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-white cursor-pointer hover:shadow-md active:scale-95"
            >
              <div className={`w-3 h-3 rounded-full ${nodeType.color}`} />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                {nodeType.label}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="ml-auto flex items-center gap-1 px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">帮助</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-[900px] h-[600px] bg-white rounded-2xl shadow-2xl flex overflow-hidden">
            <div className="w-56 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">节点说明</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {Object.entries(categories).map(([category, nodes]) => (
                <div key={category} className="mb-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {category}
                  </h4>
                  <div className="space-y-1">
                    {nodes.map((node) => (
                      <button
                        key={node.type}
                        onClick={() => setSelectedNode(node.type)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                          selectedNode === node.type
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full bg-${node.color}-500`} />
                        {node.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {currentNode ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-4 h-4 rounded-full bg-${currentNode.color}-500`} />
                      <h2 className="text-2xl font-bold text-slate-800">{currentNode.label}</h2>
                      <span className="px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded">
                        {currentNode.category}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{currentNode.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">参数说明</h3>
                    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-slate-600 w-20">参数名</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600 w-24">类型</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600 w-16">必填</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">说明</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {currentNode.params.map((param) => (
                            <tr key={param.name}>
                              <td className="px-3 py-2 font-mono text-blue-600">{param.name}</td>
                              <td className="px-3 py-2 text-slate-500">{param.type}</td>
                              <td className="px-3 py-2">
                                {param.required ? (
                                  <span className="px-2 py-0.5 text-xs font-medium text-red-600 bg-red-50 rounded">必填</span>
                                ) : (
                                  <span className="px-2 py-0.5 text-xs font-medium text-slate-500 bg-slate-100 rounded">可选</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-slate-600">{param.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">使用示例</h3>
                    <pre className="bg-slate-800 text-green-300 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap leading-relaxed">
                      {currentNode.example}
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">注意事项</h3>
                    <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="text-amber-800 text-sm space-y-1">
                        {currentNode.notes.split('\n').map((note, idx) => (
                          <p key={idx}>{note.replace(/^•\s*/, '')}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg">选择一个节点查看详细说明</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

NodeToolbar.displayName = 'NodeToolbar';
