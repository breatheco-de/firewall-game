import json
import random
import os
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/snippets/all')
def list_snippets():
    snippets_dir = 'api/snippets'
    try:
        files = os.listdir(snippets_dir)
        filenames_without_extension = [os.path.splitext(file)[0] for file in files]
        return jsonify(filenames_without_extension)
    except FileNotFoundError:
        return jsonify({"error": "Directory not found"}), 404