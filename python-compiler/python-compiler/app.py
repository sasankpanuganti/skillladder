from flask import Flask, request, jsonify, render_template
import subprocess
import sys
import os
import tempfile
import time

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/execute', methods=['POST'])
def execute_code():
    try:
        code = request.json.get('code', '')
        user_input = request.json.get('input', '')
        if not code.strip():
            return jsonify({'error': 'No code provided'})
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            # Execute with timeout and input
            result = subprocess.run(
                [sys.executable, temp_file],
                input=user_input,
                capture_output=True,
                text=True,
                timeout=10,
                cwd=tempfile.gettempdir()
            )
            
            return jsonify({
                'output': result.stdout,
                'error': result.stderr,
                'returncode': result.returncode
            })
            
        finally:
            # Clean up
            if os.path.exists(temp_file):
                os.unlink(temp_file)
                
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Code execution timed out (10s limit)'})
    except Exception as e:
        return jsonify({'error': f'Execution error: {str(e)}'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)