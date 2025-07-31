#!/usr/bin/env python3
"""
直接使用 JenkinsService 获取构建日志的示例
"""

import time
from app.services.jenkins_service import JenkinsService

def test_build_logs_direct():
    """直接测试获取构建日志"""
    print("🚀 开始直接获取构建日志测试")
    print("=" * 50)
    
    try:
        # 初始化 Jenkins 服务
        jenkins = JenkinsService()
        
        job_name = "Test_iOS_Package"
        
        # 1. 触发构建
        print(f"🔧 触发构建任务: {job_name}")
        queue_id = jenkins.build_job(job_name)
        print(f"✅ 构建已触发，队列 ID: {queue_id}")
        
        # 2. 等待构建开始
        print("⏳ 等待构建开始...")
        build_number = jenkins.wait_for_build_start(job_name, queue_id, timeout=60)
        
        if not build_number:
            print("❌ 构建未能开始")
            return
        
        print(f"✅ 构建已开始，构建号: {build_number}")
        
        # 3. 监控构建过程并获取日志
        print("👀 开始监控构建过程...")
        offset = 0
        
        while True:
            # 检查构建状态
            build_info = jenkins.get_build_info(job_name, build_number)
            is_building = build_info.get('building', False)
            
            print(f"📊 构建状态: {'运行中' if is_building else '已完成'}")
            print(f"   构建结果: {build_info.get('result', 'UNKNOWN')}")
            
            # 获取增量日志
            console_output = jenkins.get_build_console_output(job_name, build_number, start=offset)
            
            if console_output:
                print(f"📋 新增日志 ({len(console_output)} 字符):")
                print("-" * 30)
                print(console_output)
                print("-" * 30)
                offset += len(console_output)
            
            if not is_building:
                print("✅ 构建已完成")
                break
            
            print("⏳ 等待 3 秒后继续...")
            time.sleep(3)
        
        # 4. 获取完整日志
        print("\n📄 获取完整构建日志...")
        full_logs = jenkins.get_build_console_output(job_name, build_number, start=0)
        
        print(f"📊 日志统计:")
        print(f"   总长度: {len(full_logs)} 字符")
        print(f"   行数: {len(full_logs.splitlines())}")
        
        # 显示日志的前几行和后几行
        lines = full_logs.splitlines()
        if lines:
            print(f"\n📋 日志预览 (前 5 行):")
            for i, line in enumerate(lines[:5]):
                print(f"   {i+1}: {line}")
            
            if len(lines) > 5:
                print(f"\n📋 日志预览 (后 5 行):")
                for i, line in enumerate(lines[-5:]):
                    print(f"   {len(lines)-4+i}: {line}")
        
        print("\n✅ 构建日志获取测试完成！")
        
    except Exception as e:
        print(f"❌ 测试过程中出错: {str(e)}")

def test_get_existing_build_logs():
    """获取现有构建的日志"""
    print("\n🚀 获取现有构建的日志")
    print("=" * 50)
    
    try:
        jenkins = JenkinsService()
        job_name = "Test_iOS_Package"
        
        # 获取任务信息
        job_info = jenkins.get_job_info(job_name)
        last_build = job_info.get('lastBuild')
        
        if not last_build:
            print("❌ 没有找到最近的构建")
            return
        
        build_number = last_build['number']
        print(f"📊 获取最近构建的日志 (构建号: {build_number})")
        
        # 获取构建信息
        build_info = jenkins.get_build_info(job_name, build_number)
        print(f"   构建状态: {build_info.get('result', 'UNKNOWN')}")
        print(f"   构建时长: {build_info.get('duration', 0)/1000:.1f} 秒")
        
        # 获取完整日志
        console_output = jenkins.get_build_console_output(job_name, build_number)
        
        print(f"📋 日志信息:")
        print(f"   总长度: {len(console_output)} 字符")
        print(f"   行数: {len(console_output.splitlines())}")
        
        # 显示日志内容
        if console_output:
            print(f"\n📄 构建日志内容:")
            print("=" * 50)
            print(console_output)
            print("=" * 50)
        
        print("✅ 现有构建日志获取完成！")
        
    except Exception as e:
        print(f"❌ 获取现有构建日志失败: {str(e)}")

def main():
    """主函数"""
    print("🔧 Jenkins 构建日志获取测试")
    print("=" * 60)
    
    # 测试 1: 触发新构建并获取日志
    test_build_logs_direct()
    
    # 测试 2: 获取现有构建的日志
    test_get_existing_build_logs()

if __name__ == "__main__":
    main() 