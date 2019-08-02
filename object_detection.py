"""
Reference:
https://www.pyimagesearch.com/2017/09/18/real-time-object-detection-with-deep-learning-and-opencv/
"""
import numpy as np
import argparse
import cv2
import base64


# initialize the list of class labels MobileNet SSD was trained to
# detect, then generate a set of bounding box colors for each class
CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat",
	"bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
	"dog", "horse", "motorbike", "person", "pottedplant", "sheep",
	"sofa", "train", "tvmonitor"]
COLORS = np.random.uniform(0, 255, size=(len(CLASSES), 3))

# load our serialized model from disk
print("[INFO] loading model...")
net = cv2.dnn.readNetFromCaffe("MobileNetSSD_deploy.prototxt.txt", "MobileNetSSD_deploy.caffemodel")

def data_uri_to_cv2_img(uri):
	print(uri)
	encoded_data = str(uri).split(',')[1]
	img_b64decode = base64.b64decode(encoded_data)
	img_array = np.fromstring(img_b64decode, np.uint8)
	img = cv2.imdecode(img_array, cv2.COLOR_BGR2RGB)
	# print(imgdata)
	# nparr = np.fromstring(codecs.decode(uri, 'base64'), np.uint8)
	# img = cv2.imdecode(imgdata, cv2.IMREAD_COLOR)
	return img


def object_detection(img, min_confidence):
	# load the input image and construct an input blob for the image
	# by resizing to a fixed 300x300 pixels and then normalizing it
	# (note: normalization is done via the authors of the MobileNet SSD
	# implementation)
	image = data_uri_to_cv2_img(img)
	# image = cv2.imread(img)
	(h, w) = image.shape[:2]
	blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 0.007843,
		(300, 300), 127.5)

	# pass the blob through the network and obtain the detections and
	# predictions
	print("[INFO] computing object detections...")
	net.setInput(blob)
	detections = net.forward()

	# loop over the detections
	for index, i in enumerate(np.arange(0, detections.shape[2])):
		if index == 0:
			# extract the confidence (i.e., probability) associated with the
			# prediction
			confidence = detections[0, 0, i, 2]

			# filter out weak detections by ensuring the `confidence` is
			# greater than the minimum confidence
			if confidence > min_confidence:
				# extract the index of the class label from the `detections`,
				# then compute the (x, y)-coordinates of the bounding box for
				# the object
				idx = int(detections[0, 0, i, 1])
				box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
				(startX, startY, endX, endY) = box.astype("int")

				# display the prediction
				label = "{}: {:.2f}%".format(CLASSES[idx], confidence * 100)
				print("[INFO] {}".format(label))
				cv2.rectangle(image, (startX, startY), (endX, endY),
							  COLORS[idx], 2)
				y = startY - 15 if startY - 15 > 15 else startY + 15
				cv2.putText(image, label, (startX, y),
							cv2.FONT_HERSHEY_SIMPLEX, 0.5, COLORS[idx], 2)
	# show the output image
	# cv2.imshow("Output", image)
	# translated_word = translate(CLASSES[idx])
	retval, buffer = cv2.imencode('.jpg', image)
	jpg_as_text = base64.b64encode(buffer)
	return jpg_as_text, CLASSES[idx]

