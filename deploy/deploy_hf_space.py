"""一键部署后端到 Hugging Face Space（Docker）。

用法：
    python deploy/deploy_hf_space.py --repo Estate77/zyun-api

前置：hf auth login（或环境变量 HF_TOKEN）

做四件事：
1. 创建 Space（docker sdk，公开）
2. 设置 Space Secret（JWT_SECRET）与变量（CORS_ORIGINS=*）
3. 组装 Space 目录（backend 源码 + HF front-matter README）
4. 上传（Space 自动构建，URL：https://<owner小写>-<space名>.hf.space）
"""

import argparse
import secrets
import shutil
import tempfile
from pathlib import Path

from huggingface_hub import HfApi

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / "backend"

README_FM = """---
title: 智耘云 API（智慧农业 Demo）
emoji: 🌾
colorFrom: green
colorTo: yellow
sdk: docker
app_port: 8000
pinned: false
---

智耘云智慧农业 SaaS 演示版后端（FastAPI + SQLAlchemy + 演示样例数据）。

- Swagger 文档：`/docs`
- 健康检查：`/health`
- 演示账号：admin/manager/worker/guest（见 GitHub 仓库 README）
"""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", required=True, help="如 Estate77/zyun-api")
    args = parser.parse_args()

    api = HfApi()
    who = api.whoami()
    print(f"HF 登录身份: {who.get('name')}")

    # 1. 创建 Space
    url = api.create_repo(
        repo_id=args.repo,
        repo_type="space",
        space_sdk="docker",
        private=False,
        exist_ok=True,
    )
    print(f"Space 就绪: {url}")

    # 2. Secret / 变量
    api.add_space_secret(args.repo, "JWT_SECRET", secrets.token_urlsafe(48))
    api.add_space_variable(args.repo, "CORS_ORIGINS", "*")
    api.add_space_variable(args.repo, "ENVIRONMENT", "production")
    print("已设置 Secret(JWT_SECRET) 与变量(CORS_ORIGINS=*)")

    # 3. 组装上传目录
    tmp = Path(tempfile.mkdtemp(prefix="zyun_space_"))
    try:
        shutil.copytree(BACKEND / "app", tmp / "app")
        for f in ["requirements.txt", "pyproject.toml", "Dockerfile"]:
            shutil.copy2(BACKEND / f, tmp / f)
        (tmp / "README.md").write_text(README_FM, encoding="utf-8")

        # 4. 上传
        result = api.upload_folder(
            repo_id=args.repo,
            repo_type="space",
            folder_path=str(tmp),
            commit_message="deploy: 智耘云后端 v0.1",
        )
        print(f"上传完成: {result}")
        owner = args.repo.split("/")[0].lower()
        space = args.repo.split("/")[1]
        print(f"公网地址: https://{owner}-{space}.hf.space  （构建约 2-3 分钟）")
        print(f"Swagger:  https://{owner}-{space}.hf.space/docs")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()