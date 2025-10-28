#!/usr/bin/env python3
"""
Setup script for Pokemon League Tournament System
"""

import os
import sys
from pathlib import Path

def create_directories():
    """Create necessary directories if they don't exist"""
    directories = ['output', 'data', 'src', 'docs']
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✓ Created/verified directory: {directory}")

def check_data_files():
    """Check if required data files exist"""
    required_files = [
        'data/pokemon_data.json',
        'data/moves_data.json', 
        'data/type_effectiveness.json'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
        else:
            print(f"✓ Found data file: {file_path}")
    
    if missing_files:
        print(f"\n❌ Missing required data files:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        return False
    
    return True

def check_env_file():
    """Check if .env file exists and prompt user to create it"""
    env_file = Path('.env')
    
    if not env_file.exists():
        print("\n⚠️  .env file not found!")
        print("Creating template .env file...")
        
        env_template = """# Pokemon League Tournament System - API Keys
# Add your API keys below (remove # and add your actual keys)

# OpenAI (for GPT models)
# OPENAI_API_KEY=your_openai_api_key_here

# Anthropic (for Claude models)  
# ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google (for Gemini models)
# GEMINI_API_KEY=your_gemini_api_key_here

# DeepSeek (optional)
# DEEPSEEK_API_KEY=your_deepseek_api_key_here
"""
        
        with open('.env', 'w') as f:
            f.write(env_template)
        
        print("✓ Created .env template file")
        print("📝 Please edit .env file and add your API keys before running the tournament")
        return False
    else:
        print("✓ Found .env file")
        return True

def main():
    """Main setup function"""
    print("🏆 Pokemon League Tournament System - Setup")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    else:
        print(f"✓ Python version: {sys.version.split()[0]}")
    
    # Create directories
    print("\n📁 Setting up directories...")
    create_directories()
    
    # Check data files
    print("\n📊 Checking data files...")
    data_ok = check_data_files()
    
    # Check environment file
    print("\n🔑 Checking environment configuration...")
    env_ok = check_env_file()
    
    # Final status
    print("\n" + "=" * 50)
    if data_ok and env_ok:
        print("✅ Setup complete! Ready to run the tournament.")
        print("\nNext steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Run tournament: python main.py")
    else:
        print("⚠️  Setup incomplete. Please address the issues above.")
        if not data_ok:
            print("   - Ensure data files are in the data/ directory")
        if not env_ok:
            print("   - Add your API keys to the .env file")

if __name__ == "__main__":
    main()
