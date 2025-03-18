import markdown
import re
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

def parse_markdown(file_path):
    """
    Reads a machine-readable Markdown file, extracts structured elements,
    and converts it into a human-friendly HTML format.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Convert Markdown to HTML
    md_extensions = ['tables', 'fenced_code', 'toc', 'nl2br']
    html_content = markdown.markdown(content, extensions=md_extensions)
    
    # Apply additional formatting (Bootstrap or CSS-based styling)
    formatted_html = f"""
    <div class='article-container'>
        {html_content}
    </div>
    """
    return formatted_html

@app.route('/render-article', methods=['POST'])
def render_article():
    """ API endpoint to render an uploaded Markdown file as HTML. """
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file_path = f"uploads/{file.filename}"
    file.save(file_path)
    
    html_output = parse_markdown(file_path)
    return jsonify({'html': html_output})

if __name__ == '__main__':
    app.run(debug=True)
