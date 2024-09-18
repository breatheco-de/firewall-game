import os
from flask import Flask, send_from_directory, abort

app = Flask(__name__)

@app.route('/api/snippets/<path:filename>')
def serve_snippet(filename):
    print("file not found", filename)
    # Create the full path for the JavaScript file
    file_name = filename + '.js'
    
    # Ensure you are pointing to the correct path in the Vercel environment
    templates_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
    
    try:
        # Return the file from the directory if it exists
        return send_from_directory(templates_dir, file_name)
    except FileNotFoundError:
        print("file not found", templates_dir)
        abort(400)  # If file not found, return 404
