from flask import Flask, render_template, jsonify, send_from_directory
import json
import random

app = Flask(__name__)

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