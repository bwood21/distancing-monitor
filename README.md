# distancing-monitor


We created this project using Google Cloud Platform and its artifical intelligence capability. We used Google's AutoML vision for training a model. We used data from the Kaggle (https://www.kaggle.com/wobotintelligence/face-mask-detection-dataset) for this purpose. We deployed the model in Google Cloud platform by creating a Virtual Machine. We used OpenCV,a Computer Vision library, which helped us to explore the video and image data. We used YOLOv3, an Object Detection Algorithm (https://github.com/pjreddie/darknet), for identifying people. We used google Storage Buckets for storing for video input and output. We post the results of the video analysis to the firebase realtime database with an interval of 3 seconds, posting data such as total number of people in the video, how many people are following social distancing and how many people are wearing masks.

## Check it out! https://distancing-monitor.web.app
