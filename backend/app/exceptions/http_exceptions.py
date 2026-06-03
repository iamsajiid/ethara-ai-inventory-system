from fastapi import HTTPException, status


def NotFoundError(resource: str, identifier=None) -> HTTPException:
    detail = f"{resource} not found"
    if identifier is not None:
        detail = f"{resource} with id {identifier} not found"
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def ConflictError(message: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=message)


def BadRequestError(message: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


def UnprocessableError(message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=message
    )