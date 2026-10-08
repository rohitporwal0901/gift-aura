import sys

def replace_colors(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Rose Gold Replacements
    content = content.replace('#d4af37', '#C4786A')
    content = content.replace('#f59e0b', '#A85D50')
    content = content.replace('#fbbf24', '#F5DDD5')
    content = content.replace('212, 175, 55', '196, 120, 106')
    content = content.replace('245, 158, 11', '168, 93, 80')

    # Dark Theme Replacements (Making it richer/brown-tinted for premium look)
    content = content.replace('#0f1015', '#2C1A1A')
    content = content.replace('#0f1118', '#2C1A1A')
    content = content.replace('#11141c', '#3D2B2B')
    content = content.replace('#1e2230', '#5C3A36')
    content = content.replace('#1a1e29', '#5C3A36')

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == '__main__':
    replace_colors(sys.argv[1])
