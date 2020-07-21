#!/bin/bash
#this file contains paths to all the locations

export gcp_buck_ip_path="gs://first_img_buck/input/video/"
export gcp_buck_op_path="gs://first_img_buck/output/video/"

export ip_data_path="/home/srikrishna1995edu/data/input/video/"
export op_data_path="/home/srikrishna1995edu/data/output/video/"

export source_path="/home/srikrishna1995edu/source/"
export log_path="/home/srikrishna1995edu/logs/"

export script_path="/home/srikrishna1995edu/scripts/"

export ip_file_name="input_video.mp4"
export op_file_name="output_video_"$now".avi"


export model_path="/home/srikrishna1995edu/model/saved_model_face/"
export cascade_path="/home/srikrishna1995edu/model/"

export cascade_file_name="haarcascade_frontalface_default.xml"
export firebase_url="https://distancing-monitor.firebaseio.com/"

export archive_path="/home/srikrishna1995edu/archive/"
export zip_file_name="total_data_"$now".zip"
