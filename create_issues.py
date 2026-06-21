import os
import re
import subprocess

def create_issues():
    with open('issues_report.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    issues = re.split(r'---+\n+## Issue #\d+ — ', content)[1:]
    
    for i, issue in enumerate(issues):
        lines = issue.split('\n')
        title_line = lines[0].strip()
        body = '\n'.join(lines[1:]).strip()
        
        # remove summary from last issue
        if '## Resumo de Severidade' in body:
            body = body.split('## Resumo de Severidade')[0].strip()
            
        print(f"Creating issue {i+1}: {title_line}")
        
        try:
            subprocess.run(
                ['gh', 'issue', 'create', '--repo', 'jgfurlan/nexus-wallet', '--title', title_line, '--body', body],
                check=True
            )
            print(f"Issue {i+1} created successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Failed to create issue {i+1}: {e}")

if __name__ == '__main__':
    create_issues()
