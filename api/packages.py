import json
import random
from flask import jsonify, Flask

app = Flask(__name__)

def load_packages():
    with open('malicious_packages.json', 'r') as f:
        return json.load(f)
    
def generate_non_malicious_package():
    methods = ['GET', 'POST', 'PUT', 'DELETE']
    urls = ['/home', '/user', '/products', '/about', '/contact']
    return {
        "method": random.choice(methods),
        "url": random.choice(urls),
        "headers": {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json"
        },
        "body": ""
    }

@app.route('/api/packages')
def handler():
    packages = load_packages()
    num_packages = 10
    return jsonify(packages[:num_packages])