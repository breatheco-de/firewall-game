import json
import random
from flask import jsonify, Flask, request

app = Flask(__name__)

def load_packages():
    with open('api/malicious_packages.json', 'r') as f:
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

@app.route('/api/packages', methods=['GET'])
def get_packages():
    num_packages = int(request.args.get('num_packages', 10))
    packages = load_packages()
    new_packages = [generate_non_malicious_package() for _ in range(num_packages)]
    
    combined_packages = packages + new_packages
    random.shuffle(combined_packages)
    
    return jsonify(combined_packages)