from .base_agent import BaseAgent
from typing import Dict, Any, List
import re

class CodeAgent(BaseAgent):
    """Specialized agent for code analysis, debugging, and development tasks"""
    
    def __init__(self):
        system_prompt = """You are an expert Code Agent specialized in software development and code analysis.

Your capabilities include:
1. Code Review: Analyze code for bugs, security issues, and best practices
2. Debugging: Identify and explain errors, suggest fixes
3. Refactoring: Suggest improvements for code quality and performance
4. Documentation: Generate clear documentation for code
5. Code Generation: Create functions, classes, and modules based on requirements
6. Architecture: Provide architectural recommendations

When analyzing code:
- Always provide specific, actionable feedback
- Include code examples in your suggestions
- Explain the reasoning behind your recommendations
- Consider performance, security, and maintainability
- Use markdown code blocks with syntax highlighting

Be concise but thorough. Prioritize practical solutions."""

        super().__init__(
            name="Code Agent",
            role="Software Development Expert",
            system_prompt=system_prompt
        )
    
    async def analyze_code(self, code: str) -> Dict[str, Any]:
        """Analyze code snippet"""
        
        prompt = f"""Analyze the following code:

```
{code}
```

Provide:
1. Overall Assessment
2. Bugs or Issues Found
3. Security Concerns
4. Performance Optimization Opportunities
5. Best Practice Recommendations
6. Suggested Improvements with Code Examples"""

        response = await self.process(prompt)
        
        return {
            **response,
            "analysis_type": "code_snippet",
            "code_length": len(code),
            "language": self._detect_language(code)
        }
    
    async def analyze_file(self, file_path: str) -> Dict[str, Any]:
        """Analyze entire code file"""
        
        try:
            with open(file_path, 'r') as f:
                code = f.read()
            
            prompt = f"""Analyze this code file: {file_path}

```
{code[:5000]}  # First 5000 characters
```

Provide a comprehensive analysis including:
- Purpose and functionality
- Code quality assessment
- Potential bugs or issues
- Refactoring suggestions
- Documentation gaps"""

            response = await self.process(prompt)
            
            return {
                **response,
                "file_path": file_path,
                "file_size": len(code),
                "language": self._detect_language(code)
            }
            
        except Exception as e:
            return {"error": f"Failed to analyze file: {str(e)}"}
    
    async def find_bugs(self, code: str) -> List[Dict[str, Any]]:
        """Find potential bugs in code"""
        
        prompt = f"""Analyze this code for bugs, errors, and potential issues:

```
{code}
```

For each issue found, provide:
- Line number (if identifiable)
- Severity (high/medium/low)
- Description of the issue
- Suggested fix

Format as a structured list."""

        response = await self.process(prompt)
        
        # Parse response to extract bugs (simplified)
        bugs = self._parse_bug_report(response["content"])
        
        return bugs
    
    async def suggest_refactoring(self, code: str) -> Dict[str, Any]:
        """Suggest refactoring improvements"""
        
        prompt = f"""Review this code and suggest refactoring improvements:

```
{code}
```

Focus on:
- Code organization and structure
- Function/variable naming
- Reducing complexity
- Improving readability
- Following SOLID principles
- Design patterns that could be applied

Provide before/after code examples."""

        response = await self.process(prompt)
        return response
    
    async def generate_documentation(self, code: str) -> str:
        """Generate documentation for code"""
        
        prompt = f"""Generate comprehensive documentation for this code:

```
{code}
```

Include:
- Overview and purpose
- Function/class descriptions
- Parameters and return values
- Usage examples
- Edge cases and considerations

Use standard documentation format (e.g., docstrings, JSDoc, etc.)"""

        response = await self.process(prompt)
        return response["content"]
    
    def _detect_language(self, code: str) -> str:
        """Detect programming language from code"""
        
        patterns = {
            "python": [r"def\s+\w+\(", r"import\s+\w+", r"class\s+\w+:", r"print\("],
            "javascript": [r"function\s+\w+\(", r"const\s+\w+\s*=", r"=>\s*{", r"console\.log"],
            "typescript": [r"interface\s+\w+", r"type\s+\w+\s*=", r":\s*\w+\s*="],
            "java": [r"public\s+class", r"public\s+static\s+void", r"System\.out\.println"],
            "cpp": [r"#include\s*<", r"std::", r"cout\s*<<"],
            "go": [r"func\s+\w+\(", r"package\s+\w+", r"import\s+\("],
        }
        
        for lang, patterns_list in patterns.items():
            for pattern in patterns_list:
                if re.search(pattern, code):
                    return lang
        
        return "unknown"
    
    def _parse_bug_report(self, report: str) -> List[Dict[str, Any]]:
        """Parse bug report into structured format"""
        
        # Simplified parsing - in production, use more sophisticated NLP
        bugs = []
        
        lines = report.split('\n')
        current_bug = {}
        
        for line in lines:
            if 'severity' in line.lower():
                if current_bug:
                    bugs.append(current_bug)
                current_bug = {"description": line}
            elif current_bug:
                current_bug["description"] += "\n" + line
        
        if current_bug:
            bugs.append(current_bug)
        
        return bugs if bugs else [{"description": report}]
