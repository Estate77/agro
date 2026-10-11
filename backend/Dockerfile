FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# 依赖（requirements.txt 与 pyproject 同步维护）
COPY requirements.txt pyproject.toml ./
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 源码
COPY app ./app

# 非 root 运行（HF Spaces 等平台要求/推荐，端口支持 $PORT 注入）
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/data && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# 启动前自动 seed（首次/每次冷启动生成演示样例数据）
CMD ["sh", "-c", "python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]