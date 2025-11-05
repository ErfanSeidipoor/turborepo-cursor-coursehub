#!/bin/bash

# This script fixes all test files to use the correct instructor creation pattern
# and removes orderIndex from createLesson calls

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Find all .test.ts files
find "$SCRIPT_DIR" -name "*.test.ts" -type f | while read -r file; do
    echo "Fixing $file"
    
    # Add Instructor import if not present
    if ! grep -q "import.*Instructor.*from.*@repo/postgres/entities/instructor.entity" "$file"; then
        # Add import after CourseManagementService import
        sed -i.bak "/import.*CourseManagementService/a\\
import { Instructor } from '@repo/postgres/entities/instructor.entity';
" "$file"
    fi
    
    # Remove .bak files
    rm -f "${file}.bak"
done

echo "Phase 1 complete: Added Instructor imports"

# Now handle the multi-line instructor creation pattern
# This is complex, so we'll use a Python script instead
python3 << 'EOF'
import re
import glob

files = glob.glob("**/*.test.ts", recursive=True)

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Pattern 1: Replace instructor creation
    # OLD: const instructor = await courseManagementService.createInstructor({...});
    # NEW: const instructorRepository = TestManager.getRepository(Instructor);
    #      const instructor = instructorRepository.create({...});
    #      await instructorRepository.save(instructor);
    
    # First, check if instructorRepository is already declared in the function
    pattern1 = r'const\s+instructor\s*=\s*await\s+courseManagementService\.createInstructor\(\{([^}]+)\}\);'
    
    def replace_instructor(match):
        params = match.group(1)
        return f'''const instructorRepository = TestManager.getRepository(Instructor);

    const instructor = instructorRepository.create({{{params}}});
    await instructorRepository.save(instructor);'''
    
    content = re.sub(pattern1, replace_instructor, content)
    
    # Pattern 2: Remove orderIndex from createLesson calls
    pattern2 = r'(await\s+courseManagementService\.createLesson\(\{[^}]*)(,?\s*orderIndex:\s*\d+,?)([^}]*\}\);)'
    content = re.sub(pattern2, r'\1\3', content)
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"Fixed: {file_path}")

print("All files fixed!")
EOF

echo "Phase 2 complete: Fixed instructor creation and removed orderIndex"


