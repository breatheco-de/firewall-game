from flask import Flask, render_template, jsonify, send_from_directory
import json
import random

app = Flask(__name__)

# Load package data
with open('static/malicious_packages.json', 'r') as f:
    packages = json.load(f)

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

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/packages')
def get_packages():
    num_packages = 10
    non_malicious_ratio = 0.7
    non_malicious_count = int(num_packages * non_malicious_ratio)
    malicious_count = num_packages - non_malicious_count

    non_malicious_packages = [generate_non_malicious_package() for _ in range(non_malicious_count)]
    malicious_packages = random.sample(packages, malicious_count)

    return jsonify(non_malicious_packages + malicious_packages)

@app.route('/api/default_firewall_code')
def get_default_firewall_code():
    default_code = '''
function check_package(package) {
    // Implement your firewall logic here
    // Return true to allow the package, false to block it
    
    // Example: Block packages with 'vulnerability' field
    if ('vulnerability' in package) {
        return false;
    }
    return true;
}
'''
    return jsonify({"code": default_code})

@app.route('/static/snippets/<path:filename>')
def serve_snippet(filename):
    return send_from_directory('static/snippets', filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)
