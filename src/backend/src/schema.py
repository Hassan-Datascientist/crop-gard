from pydantic import BaseModel

# from pydantic.fields import File


class PredictRequest(BaseModel):
    leaf_image: str
