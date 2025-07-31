#!/usr/bin/env python3
"""
调试 Jenkins 连接问题
"""

import sys
import traceback
from app.core.config import settings
from app.services.jenkins_service import JenkinsService

def test_jenkins_service():
    """测试 Jenkins 服务"""
    print("🔧 调试 Jenkins 服务连接")
    print("=" * 50)
    
    print(f"Jenkins URL: {settings.JENKINS_URL}")
    print(f"用户名: {settings.JENKINS_USERNAME}")
    print(f"密码: {'***' if settings.JENKINS_PASSWORD else 'None'}")
    print(f"API Token: {'***' if settings.JENKINS_API_TOKEN else 'None'}")
    print()
    
    try:
        print("📡 正在创建 Jenkins 服务实例...")
        jenkins_service = JenkinsService()
        print("✅ Jenkins 服务实例创建成功")

        print("📡 正在获取服务器用户...")
        server_user = jenkins_service.get_server_user()
        print(f"✅ 服务器用户获取成功: {server_user}")
        
        print("📡 正在获取服务器版本...")
        server_version = jenkins_service.get_server_version()
        print(f"✅ 服务器版本获取成功: {server_version}")
        
        print("📡 正在获取服务器信息...")
        server_info = jenkins_service.get_server_info()
        print(f"✅ 服务器信息获取成功: {server_info}")
        
        print("📋 正在获取任务列表...")
        jobs = jenkins_service.get_jobs(depth=1)
        print(f"✅ 任务列表获取成功，共 {len(jobs)} 个任务")
        
        return True
        
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        print("\n详细错误信息:")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_jenkins_service()
    sys.exit(0 if success else 1)