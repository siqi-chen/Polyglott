# camera.py
from imutils.video import VideoStream
from imutils.video import FPS
import numpy as np
import argparse
import imutils
import time
import cv2
from imutils.video import FPS
from object_detection import object_detection

class VideoCamera(object):
    # def __init__(self):
        # Using OpenCV to capture from device 0. If you have trouble capturing
        # from a webcam, comment the line below out and use a video file
        # instead.
        # self.video = cv2.VideoCapture(0)
        # self.video = VideoStream(src=0).start()
        # If you decide to use video.mp4, you must have this file in the folder
        # as the main.py.
        # self.video = cv2.VideoCapture('video.mp4')

        # self.prototxt = 'MobileNetSSD_deploy.prototxt.txt'
        # self.model = 'MobileNetSSD_deploy.caffemodel'


    def __del__(self):
        self.video.release()

    def get_frame(self):
        # image = self.video.read()
        return object_detection()
        # We are using Motion JPEG, but OpenCV defaults to capture raw images,
        # so we must encode it into JPEG in order to correctly display the
        # video stream.
        # ret, jpeg = cv2.imencode('.jpg', image)
        # return jpeg.tobytes()

    # def show_prediction(self):
    #     return make_predictionn(self.video, self.prototxt, self.model)

    def capture_image(self):
        vs = cv2.VideoCapture(0)
        cv2.namedWindow("test")
        img_counter = 0
        success, frame = vs.read()
        cv2.imshow("test", frame)

        k = cv2.waitKey(1)
        while True:
            if k % 256 == 27:
                # ESC pressed
                print("Escape hit, closing...")
                vs.release()
                cv2.destroyAllWindows()

            if k % 256 == 32:
                # SPACE pressed
                img_name = "opencv_frame_{}.png".format(img_counter)
                cv2.imwrite(img_name, frame)
                print("{} written!".format(img_name))
                img_counter += 1

        ret, jpeg = cv2.imencode('.jpg', frame)
        return jpeg.tobytes()

