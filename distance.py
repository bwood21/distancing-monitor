import os
import tensorflow as tf
import cv2
import numpy as np
from firebase import firebase
import time
from google.cloud import automl_v1beta1
from google.cloud.automl_v1beta1.proto import service_pb2
import calculations

gcp_buck_ip_path=os.environ["gcp_buck_ip_path"]
gcp_buck_op_path=os.environ["gcp_buck_op_path"]

ip_data_path=os.environ["ip_data_path"]
op_data_path=os.environ["op_data_path"]

ip_file_name=os.environ["ip_file_name"]
op_file_name=os.environ["op_file_name"]

model_path=os.environ["model_path"]
cascade_path=os.environ["cascade_path"]

cascade_file_name=os.environ["cascade_file_name"]

firebase_url=os.environ["firebase_url"]



######
#
#functions for person identification
#
#####


# Initialize the parameters
confThreshold = 0.5  #Confidence threshold
nmsThreshold = 0.4   #Non-maximum suppression threshold

net = cv2.dnn.readNetFromDarknet("/home/srikrishna1995edu/model/yolo/yolov3.cfg", "/home/srikrishna1995edu/model/yolo/yolov3.weights")

# Get the names of the output layers
    # Get the names of all the layers in the network
layersNames = net.getLayerNames()
    # Get the names of the output layers, i.e. the layers with unconnected outputs
ln1= [layersNames[i[0] - 1] for i in net.getUnconnectedOutLayers()]



def postprocess(frame, outp):
    frameHeight = frame.shape[0]
    frameWidth = frame.shape[1]
    classIds = []
    confidences = []
    boxes = []
    for out in outp:
        for detection in out:
            scores = detection[5:]
            classId = np.argmax(scores)
            confidence = scores[classId]
            if classId == 0:
                if confidence > confThreshold:
                    center_x = int(detection[0] * frameWidth)
                    center_y = int(detection[1] * frameHeight)
                    width = int(detection[2] * frameWidth)
                    height = int(detection[3] * frameHeight)
                    left = int(center_x - width / 2)
                    top = int(center_y - height / 2)
                    classIds.append(classId)
                    confidences.append(float(confidence))
                    boxes.append([left, top, width, height])

    indices = cv2.dnn.NMSBoxes(boxes, confidences, confThreshold, nmsThreshold)
    boxes1=[]
    for i in range(len(boxes)):
        if i in indices:
            boxes1.append(boxes[i])

    return boxes1






########################################
#
#defining a function which will predict whether person wearing mask or not
#Also loading the haarcaseclassifer for face detection using open cv
#
########################################

def get_prediction(content, project_id, model_id):
    prediction_client = automl_v1beta1.PredictionServiceClient()
    name = 'projects/{}/locations/us-central1/models/{}'.format(project_id, model_id)
    payload = {'image': {'image_bytes': content }}
    params = {}
    request = prediction_client.predict(name, payload, params)
    return request

face_detect=cv2.CascadeClassifier(cascade_path+cascade_file_name)

#authenticating firebase database
firebase=firebase.FirebaseApplication(firebase_url,None)


labels_dict={0:'with_mask',1:'without_mask'}
color_dict={0:(0,255,0),1:(0,0,255)}

#reading the video file using opencv
webcam = cv2.VideoCapture(ip_data_path+ip_file_name)

#getting the parameters of the video file
fourcc = cv2.VideoWriter_fourcc(*'XVID')
fps = webcam.get(cv2.CAP_PROP_FPS)
width = webcam.get(cv2.CAP_PROP_FRAME_WIDTH)
height = webcam.get(cv2.CAP_PROP_FRAME_HEIGHT)
frame_count=webcam.get(cv2.CAP_PROP_FRAME_COUNT)
#creating a videowriter from opencv for saving the output video file
out = cv2.VideoWriter(op_data_path+op_file_name, fourcc, fps, (int(width), int(height+100)))
frame_number=0
pscore_list=[]
dscore_list=[]
mscore_list=[]
points=[(30,450),(820,450),(820,250),(30,250),(500,400),(665,400),(510,325)]
while True:

    (grabbed, im) = webcam.read()

    if not grabbed:
        break

    frame_number+=1
    #faces = face_detect.detectMultiScale(im)

#total number of faces / people in the images
    blob = cv2.dnn.blobFromImage(im, 1/255, (416,416), [0,0,0], 1, crop=False)
    # Sets the input to the network
    net.setInput(blob)

    # Runs the forward pass to get output of the output layers
    outp = net.forward(ln1)

    persons=postprocess(im, outp)

    



    pscore=len(persons)
    mscore=0
    dscore=0
    seconds=time.time()

    src = np.float32(np.array(points[:4]))
    dest = np.float32([[0, height], [width, height], [width, 0], [0, 0]])
    transform = cv2.getPerspectiveTransform(src, dest)
    pts = np.float32(np.array([points[4:7]]))
    warped_pt = cv2.perspectiveTransform(pts, transform)[0]
    distance_w = np.sqrt((warped_pt[0][0] - warped_pt[1][0]) ** 2 + (warped_pt[0][1] - warped_pt[1][1]) ** 2)
    distance_h = np.sqrt((warped_pt[0][0] - warped_pt[2][0]) ** 2 + (warped_pt[0][1] - warped_pt[2][1]) ** 2)


    person_points = calculations.get_transformed_points(persons, transform)
    distances_mat, bxs_mat = calculations.get_distances(persons, person_points, distance_w, distance_h)
    risk_count = calculations.get_count(distances_mat)
    dscore=risk_count[1]

    for person in persons:
        (x, y, w, h) = [p for p in person]
        person_img=im[y:y+h,x:x+w]



        success, encoded_image = cv2.imencode('.png', person_img)
        if not success:
            print("failed loading encoded image")
        content = encoded_image.tobytes()
            #output=get_prediction(content,'elated-guild-282619', 'ICN6090029979507097600').payload[0].display_name
        pred = get_prediction(content,'elated-guild-282619', 'ICN6090029979507097600')
        if len(pred.payload)>0:
            output=pred.payload[0].display_name
            if output=='with_mask':
                label=0
                mscore+=1
            else:
                label=1


            #cv2.rectangle(im, (x,y), (x+w,y+h), color_dict[label],2)
            #cv2.rectangle(im, (x,y-40), (x+w,y), color_dict[label],-1)
            #cv2.putText(im, labels_dict[label], (x, y-10), cv2.FONT_HERSHEY_SIMPLEX,0.8,(255,255,255),2)

    red = (0, 0, 255)
    green = (0, 255, 0)
    for i in range(len(persons)):
        x,y,w,h = persons[i][:]
        cv2.rectangle(im,(x,y),(x+w,y+h),green,2)


    for i in range(len(bxs_mat)):
        person1=bxs_mat[i][0]
        person2=bxs_mat[i][1]
        closeness = bxs_mat[i][2]


        if closeness == 0:
            x,y,w,h = person1[:]
            cv2.rectangle(im,(x,y),(x+w,y+h),red,2)

            x1,y1,w1,h1 = person2[:]
            cv2.rectangle(im,(x1,y1),(x1+w1,y1+h1),red,2)
            

    pad = np.full((100,im.shape[1],3), [110, 110, 100], dtype=np.uint8)

    cv2.putText(pad, "Score of masks and social distancing ", (50, 30),cv2.FONT_HERSHEY_SIMPLEX, 0.7, (100, 100, 0), 2)
    cv2.putText(pad, "People following social distancing : " + str(risk_count[1]) + " people", (50, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)
    cv2.putText(pad, "People wearing masks " + str(mscore) + " people", (50, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)

    im=np.vstack((im,pad))


    out.write(im)
    if int(frame_number) in (int(j) for j in range(1,int(frame_count),3*int(fps))):
        pscore_list.append(pscore)
        mscore_list.append(mscore)
        dscore_list.append(dscore)

data={'pscore':pscore_list,
        'mscore':mscore_list,
        'dscore':dscore_list,
        'url':"https://storage.googleapis.com/first_img_buck/output/video/"+op_file_name}
result=firebase.put(str(int(seconds))+"/Cameras/",1,data)

webcam.release()
out.release()




cv2.destroyAllWindows()



