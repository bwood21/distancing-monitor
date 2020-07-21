#!/bin/bash


################################################
#
#Filewatcher Begins
#
################################################



#Checking if the input video file exists in the google storage bucket

export now="$(date +'%d_%m_%Y_%H_%M_%S')"

export config="/home/srikrishna1995edu/scripts/config.sh"

. "$config"

echo "$ip_data_path"


gsutil ls $gcp_buck_ip_path$ip_file_name 

if [ $? -eq 0 ]; then

	echo "Taraka"

	gsutil cp $gcp_buck_ip_path$ip_file_name $ip_data_path$ip_file_name
	if [ $? -eq 0 ]; then
		echo "File copy successful"
	fi
else
	echo "no file"
	exit 0
fi



#python3 $source_path/face_main_gcp.py > $log_path/python/current.log

python3 $source_path/distance.py > $log_path/python/current.log


if [ $? -eq 0 ]; then
	gsutil cp $op_data_path$op_file_name $gcp_buck_op_path$op_file_name
	if [ $? -eq 0 ]; then

		gsutil acl set $script_path/acl.txt $gcp_buck_op_path$op_file_name
		echo "Process completed successfully"

	else
		echo "Unsucceful copy of file to gcp bucket"
	fi
else
	echo "Something wrong with python script"

fi

