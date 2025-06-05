# Stage 1: Build shared libraries 
FROM amazonlinux:2 AS builder

RUN yum install -y \
    gcc \
    make \
    tar gzip \
    && yum clean all

# Stage 2: Lambda base image
FROM public.ecr.aws/lambda/python:3.10

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the code files required by Lambda
COPY handler.py .
COPY lambda_handler.py .
COPY model_utils.py .
COPY model.pt .
COPY ddb_utils.py .
COPY requirements.txt .

# Lambda entrance
CMD ["lambda_handler.lambda_handler"]
