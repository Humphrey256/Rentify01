import sys
import os

print("Current directory:", os.getcwd())
print("Python path:")
for path in sys.path:
    print(f"  - {path}")
