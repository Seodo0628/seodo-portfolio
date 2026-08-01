import re
import os

# 定义外部URL到本地路径的映射
path_replacements = {
    # Favicons
    'https://unseen.co/wp-content/themes/unseen/public/favicon/apple-touch-icon.png': 'assets/images/favicon/apple-touch-icon.png',
    'https://unseen.co/wp-content/themes/unseen/public/favicon/favicon-32x32.png': 'assets/images/favicon/favicon-32x32.png',
    'https://unseen.co/wp-content/themes/unseen/public/favicon/favicon-16x16.png': 'assets/images/favicon/favicon-16x16.png',
    'https://unseen.co/wp-content/themes/unseen/public/favicon/safari-pinned-tab.svg': 'assets/images/favicon/safari-pinned-tab.svg',
    'https://secure.insightful-cloud-365.com/js/264099.js': '',
    'https://secure.insightful-cloud-365.com/264099.png': '',
    'https://secure.insightful-cloud-365.com/js/sc/264099.js': '',
    # Images
    'https://unseen.co/wp-content/uploads/2022/11/social-meta.jpg': 'assets/images/social-meta.jpg',
    # CSS files
    'https://unseen.co/wp-includes/css/classic-themes.min.css': 'wp-includes/css/classic-themes.min.css',
    'https://unseen.co/wp-content/themes/unseen/public/css/loader.css': '',
    'https://unseen.co/wp-content/themes/unseen/public/css/loader.css.map': '',
    # Root paths
    'https://unseen.co/': '',
    'https://unseen.co': '',
    'https://unseen.co/#website': '',
    'https://unseen.co/#breadcrumb': '',
    'https://unseen.co/?s={search_term_string}': '/?s={search_term_string}',
}

# 确保目标目录存在
for old, new in path_replacements.items():
    if new and not new.startswith('//'):
        # 创建目录
        dirs = os.path.dirname(new).strip('/')
        if dirs:
            os.makedirs(os.path.join(os.getcwd(), dirs), exist_ok=True)

# 读取 HTML
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 替换所有外部 URL
for old_url, new_url in path_replacements.items():
    if new_url == '':  # 删除该资源
        # 删除整个标签或属性
        html = re.sub(r'[^>]+\s+href\s*=\s*"' + re.escape(old_url) + r'"[^>]*', '', html, flags=re.IGNORECASE)
        html = re.sub(r'[^>]+\s+src\s*=\s*"' + re.escape(old_url) + r'"[^>]*', '', html, flags=re.IGNORECASE)
        html = re.sub(r'[^>]+\s+src\s*=\s*"' + re.escape(old_url) + r'"[^>]*', '', html, flags=re.IGNORECASE)
    else:
        # 替换 href 属性
        html = html.replace(old_url, new_url)
        # 替换 src 属性
        html = html.replace(old_url, new_url)

# 写入新文件
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("路径替换完成！")
