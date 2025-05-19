from flask import Flask, send_from_directory, render_template

app = Flask(__name__, static_url_path='', static_folder='.')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def send_file(path):
    return send_from_directory('.', path)

# Make sure enhanced-umd-styles.css is properly served
@app.route('/enhanced-umd-styles.css')
def serve_enhanced_styles():
    return send_from_directory('.', 'enhanced-umd-styles.css', mimetype='text/css')

if __name__ == '__main__':
    app.run(port=8080, debug=True)