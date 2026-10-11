"""基础冒烟测试。仅验证应用能启动 + 健康检查 + 登录路由可达。"""

from fastapi.testclient import TestClient


def test_health(client: TestClient):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_login_route_reachable(client: TestClient):
    """登录路由可达（不保证成功，因为测试库是空的）。"""
    r = client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code in (200, 401)
    assert "code" in r.json()


def test_data_asset_list_unauthorized(client: TestClient):
    """数据资产列表要求登录。"""
    r = client.get("/api/v1/data-assets")
    assert r.status_code == 401


def test_public_batch_404(client: TestClient):
    """C 端扫码公共接口：未知批次码应 404 而非 500。"""
    r = client.get("/api/v1/batches/public/NOT_EXIST")
    assert r.status_code == 404
    body = r.json()
    assert body["code"] != 0