# # Stage 1: Build shared libraries 
# FROM amazonlinux:2 AS builder

# RUN yum install -y \
#     gcc \
#     make \
#     tar gzip \
#     && yum clean all

# # Stage 2: Lambda base image
# FROM public.ecr.aws/lambda/python:3.10

# # Install Python dependencies
# COPY requirements.txt ./
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy the code files required by Lambda
# COPY handler.py .
# COPY lambda_handler.py .
# COPY model_utils.py .
# COPY model.pt .
# COPY ddb_utils.py .

# # Lambda entrance
# CMD ["lambda_handler.lambda_handler"]


FROM public.ecr.aws/lambda/python:3.10

# 
RUN yum install -y mesa-libGL && yum clean all

# 
ENV MPLCONFIGDIR=/tmp
ENV ULTRALYTICS_SETTINGS=/tmp
ENV YOLO_CONFIG_DIR=/tmp

#
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 
COPY handler.py lambda_handler.py model_utils.py ddb_utils.py model.pt ./

# Lambda 
CMD ["lambda_handler.lambda_handler"]
