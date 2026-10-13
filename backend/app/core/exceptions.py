"""自定义业务异常与全局异常处理。"""

from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class BizError(Exception):
    """业务异常基类。"""

    code: int = 40000
    message: str = "业务异常"

    def __init__(self, message: str | None = None, code: int | None = None, data: Any = None) -> None:
        super().__init__(message or self.message)
        self.message = message or self.message
        self.code = code or self.code
        self.data = data


class UnauthorizedError(BizError):
    code = 40101
    message = "未登录或令牌失效"


class ForbiddenError(BizError):
    code = 40301
    message = "无权限访问"


class NotFoundError(BizError):
    code = 40401
    message = "资源不存在"


class ConflictError(BizError):
    code = 40901
    message = "资源冲突"


class ValidationError(BizError):
    code = 42201
    message = "参数校验失败"


def _wrap(code: int, message: str, data: Any | None = None) -> dict[str, Any]:
    return {"code": code, "message": message, "data": data}


def _jsonable(obj: Any) -> Any:
    """递归清洗校验错误中的 bytes（Pydantic v2 的 input/ctx 可能含 bytes，无法直接 JSON 序列化）。"""
    if isinstance(obj, bytes):
        return obj.decode("utf-8", errors="replace")
    if isinstance(obj, dict):
        return {k: _jsonable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_jsonable(v) for v in obj]
    return obj


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(BizError)
    async def _biz_error(_: Request, exc: BizError) -> JSONResponse:
        return JSONResponse(
            status_code=_status_for(exc.code),
            content=_wrap(exc.code, exc.message, exc.data),
        )

    @app.exception_handler(RequestValidationError)
    async def _validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=_wrap(42201, "参数校验失败", _jsonable(exc.errors())),
        )

    @app.exception_handler(Exception)
    async def _unhandled(_: Request, exc: Exception) -> JSONResponse:
        # 生产环境可改为只返回 code+message，不返回堆栈
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_wrap(50000, f"服务器内部错误: {exc.__class__.__name__}"),
        )


def _status_for(code: int) -> int:
    if 40100 <= code < 40200:
        return status.HTTP_401_UNAUTHORIZED
    if 40300 <= code < 40400:
        return status.HTTP_403_FORBIDDEN
    if 40400 <= code < 40500:
        return status.HTTP_404_NOT_FOUND
    if 40900 <= code < 41000:
        return status.HTTP_409_CONFLICT
    if 42200 <= code < 42300:
        return status.HTTP_422_UNPROCESSABLE_ENTITY
    return status.HTTP_400_BAD_REQUEST