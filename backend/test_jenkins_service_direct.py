#!/usr/bin/env python3
"""
直接测试 jenkins_service.py 中的接口

这个测试文件直接调用 jenkins_service.py 中的方法，而不是通过 HTTP API
"""

import time
import sys
import os
from typing import Dict, Any

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.jenkins_service import JenkinsService
from app.core.config import settings

class JenkinsServiceDirectTest:
    """直接测试 JenkinsService 类"""
    
    def __init__(self):
        self.job_name = "Test_iOS_Package"
        try:
            self.jenkins_service = JenkinsService()
            print(f"✅ JenkinsService 初始化成功")
            print(f"   Jenkins URL: {settings.JENKINS_URL}")
            print(f"   Jenkins 用户: {settings.JENKINS_USERNAME}")
        except Exception as e:
            print(f"❌ JenkinsService 初始化失败: {str(e)}")
            raise
    
    def test_server_info(self):
        """测试获取服务器信息"""
        print("🔍 测试获取 Jenkins 服务器信息...")
        
        try:
            info = self.jenkins_service.get_server_info()
            print(f"✅ 获取服务器信息成功")
            print(f"   版本: {info.get('version', 'Unknown')}")
            print(f"   描述: {info.get('description', 'No description')}")
            return info
        except Exception as e:
            print(f"❌ 获取服务器信息失败: {str(e)}")
            return None
    
    def test_job_info(self):
        """测试获取任务信息"""
        print(f"🔍 测试获取任务信息: {self.job_name}")
        
        try:
            job_info = self.jenkins_service.get_job_info(self.job_name)
            print(f"✅ 获取任务信息成功")
            print(f"   任务名称: {job_info.get('name', 'Unknown')}")
            print(f"   任务描述: {job_info.get('description', 'No description')}")
            print(f"   是否构建中: {job_info.get('inQueue', False)}")
            return job_info
        except Exception as e:
            print(f"❌ 获取任务信息失败: {str(e)}")
            return None
    
    def test_build_console_output(self, build_number: int = 7):
        """测试获取构建控制台输出
        
        直接调用 jenkins_service.py 中的 get_build_console_output 方法
        """
        print(f"🔍 测试获取构建控制台输出 (构建号: {build_number})...")
        
        try:
            console_output = self.jenkins_service.get_build_console_output(self.job_name, build_number)
            print(f"✅ 获取构建控制台输出成功")
            print(f"   日志长度: {len(console_output)} 字符")
            print(f"   日志预览: {console_output[:200]}...")
            return console_output
        except Exception as e:
            print(f"❌ 获取构建控制台输出失败: {str(e)}")
            return None
    
    def test_build_info(self, build_number: int = 7):
        """测试获取构建信息"""
        print(f"🔍 测试获取构建信息 (构建号: {build_number})...")
        
        try:
            build_info = self.jenkins_service.get_build_info(self.job_name, build_number)
            print(f"✅ 获取构建信息成功")
            print(f"   构建号: {build_info.get('number', 'Unknown')}")
            print(f"   构建结果: {build_info.get('result', 'Unknown')}")
            print(f"   是否构建中: {build_info.get('building', False)}")
            print(f"   构建时长: {build_info.get('duration', 0)/1000:.1f} 秒")
            return build_info
        except Exception as e:
            print(f"❌ 获取构建信息失败: {str(e)}")
            return None
    
    def test_build_job(self):
        """测试触发构建"""
        print(f"🔍 测试触发构建: {self.job_name}")
        
        try:
            queue_id = self.jenkins_service.build_job(self.job_name)
            print(f"✅ 触发构建成功")
            print(f"   队列 ID: {queue_id}")
            return queue_id
        except Exception as e:
            print(f"❌ 触发构建失败: {str(e)}")
            return None
    
    def test_wait_for_build_start(self, queue_id: int):
        """测试等待构建开始"""
        print(f"🔍 测试等待构建开始 (队列 ID: {queue_id})...")
        
        try:
            build_number = self.jenkins_service.wait_for_build_start(self.job_name, queue_id, timeout=30)
            if build_number:
                print(f"✅ 构建已开始")
                print(f"   构建号: {build_number}")
                return build_number
            else:
                print(f"❌ 等待构建开始超时或构建被取消")
                return None
        except Exception as e:
            print(f"❌ 等待构建开始失败: {str(e)}")
            return None
    
    def test_is_build_running(self, build_number: int):
        """测试检查构建是否正在运行"""
        print(f"🔍 测试检查构建是否正在运行 (构建号: {build_number})...")
        
        try:
            is_running = self.jenkins_service.is_build_running(self.job_name, build_number)
            print(f"✅ 检查构建状态成功")
            print(f"   是否正在运行: {is_running}")
            return is_running
        except Exception as e:
            print(f"❌ 检查构建状态失败: {str(e)}")
            return None
    
    def run_full_test(self):
        """运行完整的测试"""
        print("🚀 开始完整的 JenkinsService 直接测试")
        print("=" * 60)
        
        # 1. 测试服务器信息
        print("📋 步骤 1: 测试服务器信息")
        server_info = self.test_server_info()
        
        print("\n" + "-" * 40)
        
        # 2. 测试任务信息
        print("📋 步骤 2: 测试任务信息")
        job_info = self.test_job_info()
        
        print("\n" + "-" * 40)
        
        # 3. 测试获取现有构建的日志
        print("📋 步骤 3: 测试获取现有构建的日志")
        console_output = self.test_build_console_output(build_number=7)
        
        print("\n" + "-" * 40)
        
        # 4. 测试获取构建信息
        print("📋 步骤 4: 测试获取构建信息")
        build_info = self.test_build_info(build_number=7)
        
        print("\n" + "=" * 60)
        print("📊 测试结果总结:")
        print(f"   服务器信息: {'✅' if server_info else '❌'}")
        print(f"   任务信息: {'✅' if job_info else '❌'}")
        print(f"   构建日志: {'✅' if console_output else '❌'}")
        print(f"   构建信息: {'✅' if build_info else '❌'}")
    
    def run_build_test(self):
        """运行构建测试（触发新构建并监控）"""
        print("🚀 开始构建测试")
        print("=" * 60)
        
        # 1. 触发构建
        print("📋 步骤 1: 触发构建")
        queue_id = self.test_build_job()
        
        if not queue_id:
            print("❌ 无法触发构建，退出测试")
            return
        
        print("\n" + "-" * 40)
        
        # 2. 等待构建开始
        print("📋 步骤 2: 等待构建开始")
        build_number = self.test_wait_for_build_start(queue_id)
        
        if not build_number:
            print("❌ 构建未开始，退出测试")
            return
        
        print("\n" + "-" * 40)
        
        # 3. 监控构建过程
        print("📋 步骤 3: 监控构建过程")
        is_running = True
        while is_running:
            try:
                is_running = self.test_is_build_running(build_number)
                if is_running:
                    print(f"⏳ 构建进行中，等待 5 秒...")
                    time.sleep(5)
                else:
                    print("✅ 构建已完成")
            except KeyboardInterrupt:
                print("\n⏹️  用户中断监控")
                break
        
        print("\n" + "-" * 40)
        
        # 4. 获取最终日志
        print("📋 步骤 4: 获取最终构建日志")
        final_logs = self.test_build_console_output(build_number)
        
        if final_logs:
            print(f"✅ 获取最终日志成功，长度: {len(final_logs)} 字符")
        else:
            print("❌ 获取最终日志失败")

def main():
    """主函数"""
    try:
        # 创建测试实例
        test = JenkinsServiceDirectTest()
        
        # 检查命令行参数
        if len(sys.argv) > 1 and sys.argv[1] == "--build":
            # 运行构建测试
            test.run_build_test()
        else:
            # 运行完整测试
            test.run_full_test()
            
    except Exception as e:
        print(f"❌ 测试过程中出现异常: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 