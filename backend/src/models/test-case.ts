/**
 * 测试用例步骤接口
 */
export interface TestCaseStep {
  id: string;
  type: 'aiTap' | 'aiInput' | 'aiWaitFor' | 'aiAssert' | 'aiNavigate' | 'aiScroll' | 'aiRightClick' | 'aiDoubleClick' | 'aiReload' | 'aiQuery' | 'aiBoolean' | 'aiNumber' | 'aiString';
  params: {
    target?: string;
    value?: string;
    url?: string;
    timeout?: number;
    returnType?: 'json' | 'boolean' | 'number' | 'string';
    direction?: 'up' | 'down' | 'left' | 'right' | 'top' | 'bottom';
  };
}

/**
 * 测试用例数据模型
 */
export interface TestCase {
  id: string;
  name: string;
  baseUrl: string;
  createdAt: string;
  updatedAt: string;
  steps: TestCaseStep[];
}

/**
 * 创建测试用例时的输入数据（不含id、createdAt、updatedAt）
 */
export interface CreateTestCaseInput {
  name: string;
  baseUrl: string;
  steps?: TestCaseStep[];
}

/**
 * 更新测试用例时的输入数据
 */
export interface UpdateTestCaseInput {
  name?: string;
  baseUrl?: string;
  steps?: TestCaseStep[];
}
