from flask import Flask, render_template, Response, make_response, request, jsonify
from flask_restful import Resource, Api, reqparse, abort
from text_recognition import text_recognition
from object_detection import object_detection

app = Flask(__name__)




img_data = ""

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'GET':
        return render_template('index.html')
    return render_template('index.html')

@app.route('/text')
def feed_img1():
    img_data = request.args.get('data_uri')
    min_confidence = 0.5
    width = 320
    height = 320
    padding = 0.0
    output, text = text_recognition(img_data, min_confidence, width, height, padding)
    print(output.decode('utf8'))
    print("Recognizing Text...")
    return '{}@{}'.format(output.decode('utf8'), text)

@app.route('/object')
def feed_img2():
    img_data = request.args.get('data_uri')
    min_confidence = 0.5
    output, obj_name = object_detection(img_data, min_confidence)
    print(output.decode('utf8'))
    print("Detecting Image...")
    print(obj_name)
    return '{}@{}'.format(output.decode('utf8'), obj_name)



if __name__ == '__main__':
    app.run(host='0.0.0.0', port="5000", debug=True)