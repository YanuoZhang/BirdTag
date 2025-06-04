# Stage 1: Build libsndfile and all dependencies
FROM amazonlinux:2 AS builder

RUN yum install -y \
    ffmpeg \
    gcc \
    make \
    libsndfile \
    libsndfile-devel \
    libvorbis \
    libvorbis-devel \
    flac \
    gsm \
    tar gzip

# Stage 2: Lambda base image
FROM public.ecr.aws/lambda/python:3.10

COPY --from=builder /usr/lib64/libsndfile.so* /usr/lib64/
COPY --from=builder /usr/lib64/libFLAC.so* /usr/lib64/
COPY --from=builder /usr/lib64/libgsm.so* /usr/lib64/
COPY --from=builder /usr/lib64/libvorbis.so* /usr/lib64/
COPY --from=builder /usr/lib64/libvorbisenc.so* /usr/lib64/
COPY --from=builder /usr/lib64/libogg.so* /usr/lib64/

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["handler.lambda_handler"]
