from flask import Flask, render_template, jsonify, send_from_directory
import json
import random

app = Flask(__name__)

@app.route('/api/firewall')
def get_default_firewall_code():
    default_code = '''
function check_package(package) {
    // Implement your firewall logic here
    // Return true to allow the package, false to block it
    
    // Example: Block packages with GET method
    if (package.method === 'GET') {
        return false;
    }
    return true;
}
'''
    return jsonify({"code": default_code})