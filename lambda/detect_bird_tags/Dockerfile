FROM public.ecr.aws/lambda/python:3.10

# 1. Copy only requirements first (for cache efficiency)
COPY requirements.txt ./

# 2. Install dependencies
RUN pip install -r requirements.txt

# 3. Copy the rest of the code
COPY . .

# 4. Set the handler (entrypoint)
CMD ["lambda_handler.lambda_handler"]
