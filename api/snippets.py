import json
import random
from flask import Flask, send_from_directory

app = Flask(__name__)

@app.route('/api/snippets/<path:filename>')
def handler(filename):
    return send_from_directory('snippets', filename)