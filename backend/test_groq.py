"""
Quick test to verify Groq API is working
Run this locally to test your Groq setup before deploying
"""

import os
from dotenv import load_dotenv

load_dotenv()

print("=" * 60)
print("GROQ API CONFIGURATION TEST")
print("=" * 60)

# Check environment variable
groq_key = os.getenv("GROQ_API_KEY")
print(f"\n1. GROQ_API_KEY environment variable:")
if groq_key:
    print(f"   ✓ SET: {groq_key[:10]}...{groq_key[-4:]}")
    print(f"   Length: {len(groq_key)} characters")
else:
    print("   ✗ NOT SET!")
    print("   Add to .env file: GROQ_API_KEY=your_key_here")
    exit(1)

# Test Groq API connection
print(f"\n2. Testing Groq API connection...")
try:
    from langchain_groq import ChatGroq
    
    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=groq_key,
        timeout=30
    )
    print(f"   ✓ ChatGroq initialized successfully")
    
    # Test actual API call
    print(f"\n3. Testing actual API call...")
    from langchain_core.messages import HumanMessage
    
    messages = [HumanMessage(content="Say 'Hello from Groq!' and nothing else.")]
    response = llm.invoke(messages)
    
    print(f"   ✓ API call successful!")
    print(f"   Response: {response.content}")
    
    print(f"\n" + "=" * 60)
    print("✓ ALL TESTS PASSED - Groq is configured correctly!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Make sure GROQ_API_KEY is set in Render environment variables")
    print("2. Add USE_OLLAMA=false to Render environment variables")
    print("3. Redeploy on Render")
    
except Exception as e:
    print(f"   ✗ ERROR: {e}")
    print(f"\n" + "=" * 60)
    print("✗ TEST FAILED - Check your Groq API key")
    print("=" * 60)
    print("\nPossible issues:")
    print("1. Invalid API key")
    print("2. Network connectivity issues")
    print("3. Groq API rate limit reached")
    print("4. Missing dependencies (run: pip install langchain-groq)")
