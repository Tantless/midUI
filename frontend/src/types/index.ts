/**
 * 测试用例类型定义
 */

/**
 * 测试步骤类型
 */
export interface TestCaseStep {
  id: string;
  type: 'aiTap' | 'aiInput' | 'aiWaitFor' | 'aiAssert' | 'aiNavigate' | 'aiScroll' | 'aiRightClick' | 'aiDoubleClick' | 'aiReload' | 'aiQuery' | 'aiBoolean' | 'aiNumber' | 'aiString';
  params?: Record<string, any> & {
    timeout?: number;
    returnType?: 'json' | 'boolean' | 'number' | 'string';
    direction?: 'up' | 'down' | 'left' | 'right' | 'top' | 'bottom';
  };
  position: {
    x: number;
    y: number;
  };
}

/**
 * 测试用例
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
 * 创建测试用例输入
 */
export interface CreateTestCaseInput {
  name: string;
  baseUrl: string;
  steps?: TestCaseStep[];
}

/**
 * 更新测试用例输入
 */
export interface UpdateTestCaseInput {
  name?: string;
  baseUrl?: string;
  steps?: TestCaseStep[];
}
