#!/usr/bin/env python3
"""
Quick verification script to test if the Groq timeout fix works
Run this after making changes to verify everything is configured correctly
"""

import os
import sys
import time
from dotenv import load_dotenv

load_dotenv()

print("=" * 70)
print("🔧 GROQ TIMEOUT FIX VERIFICATION")
print("=" * 70)

# Step 1: Check environment variables
print("\n[1/4] Checking environment variables...")
groq_key = os.getenv("GROQ_API_KEY")
groq_model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

if not groq_key:
    print("   ❌ GROQ_API_KEY not set!")
    print("   ➜ Create .env file with: GROQ_API_KEY=gsk_your_key_here")
    sys.exit(1)

print(f"   ✅ GROQ_API_KEY: {groq_key[:10]}...{groq_key[-4:]}")
print(f"   ✅ GROQ_MODEL: {groq_model}")

# Step 2: Verify model is the fastest one
print("\n[2/4] Verifying model configuration...")
if groq_model == "llama-3.1-8b-instant":
    print("   ✅ Using FASTEST model (llama-3.1-8b-instant)")
elif groq_model == "mixtral-8x7b-32768":
    print("   ⚠️  Using FAST model (mixtral-8x7b-32768) - acceptable")
elif "70b" in groq_model.lower():
    print(f"   ❌ Using SLOW model ({groq_model})")
    print("   ➜ Change GROQ_MODEL to: llama-3.1-8b-instant")
    print("   ➜ This model will cause timeouts!")
    sys.exit(1)
else:
    print(f"   ⚠️  Unknown model: {groq_model}")

# Step 3: Test Groq API connection
print("\n[3/4] Testing Groq API connection...")
try:
    from langchain_groq import ChatGroq
    from langchain_core.messages import HumanMessage
    
    llm = ChatGroq(
        model=groq_model,
        api_key=groq_key,
        timeout=60,
        max_retries=3
    )
    print("   ✅ ChatGroq initialized")
    
    # Test with timeout measurement
    print("   ⏱️  Testing response time...")
    start_time = time.time()
    
    messages = [HumanMessage(content="Say 'OK' and nothing else.")]
    response = llm.invoke(messages)
    
    elapsed = time.time() - start_time
    print(f"   ✅ Response received in {elapsed:.2f}s")
    print(f"   📝 Response: {response.content}")
    
    # Verify response time
    if elapsed < 5:
        print("   ✅ Response time is FAST (< 5s)")
    elif elapsed < 15:
        print("   ⚠️  Response time is acceptable (5-15s)")
    else:
        print(f"   ❌ Response time is TOO SLOW ({elapsed:.2f}s)")
        print("   ➜ Consider using llama-3.1-8b-instant instead")
        
except Exception as e:
    print(f"   ❌ Error: {str(e)}")
    print(f"   ➜ Check your GROQ_API_KEY is valid")
    print(f"   ➜ Visit: https://console.groq.com/keys")
    sys.exit(1)

# Step 4: Check agent configuration
print("\n[4/4] Checking agent configuration...")
try:
    from agents.base_agent import BaseAgent
    
    # Create a test agent
    test_agent = BaseAgent(
        name="TestAgent",
        role="Tester",
        system_prompt="You are a test agent."
    )
    print("   ✅ BaseAgent initialized successfully")
    print(f"   ✅ Agent LLM configured: {type(test_agent.llm).__name__}")
    
    # Check timeout settings
    if hasattr(test_agent.llm, 'timeout'):
        timeout = test_agent.llm.timeout
        print(f"   ✅ Timeout setting: {timeout}s")
        if timeout >= 60:
            print("   ✅ Timeout is sufficient (≥60s)")
        else:
            print(f"   ⚠️  Timeout might be too low ({timeout}s)")
    
except Exception as e:
    print(f"   ⚠️  Could not verify agent config: {str(e)}")

# Final summary
print("\n" + "=" * 70)
print("✅ VERIFICATION COMPLETE")
print("=" * 70)
print("\n📋 Summary:")
print(f"   • Groq API Key: Configured ✅")
print(f"   • Model: {groq_model}")
print(f"   • API Response: Working ✅")
print(f"   • Response Time: {elapsed:.2f}s")
print("\n🚀 Next Steps:")
print("   1. Push changes to GitHub")
print("   2. Redeploy on Render")
print("   3. Verify GROQ_MODEL=llama-3.1-8b-instant in Render env vars")
print("   4. Test the live app")
print("\n💡 Render Environment Variables:")
print("   GROQ_API_KEY=gsk_your_key_here")
print("   GROQ_MODEL=llama-3.1-8b-instant")
print("\n🔗 Useful Links:")
print("   • Config Check: https://synapse-ai-wr9n.onrender.com/api/config-check")
print("   • Health Check: https://synapse-ai-wr9n.onrender.com/health")
print("   • Groq Console: https://console.groq.com/")
print("=" * 70)
