from typing import List, Optional

from pydantic import BaseModel

# from pydantic.fields import File


class PredictRequest(BaseModel):
    leaf_image: str


class PlantMatch(BaseModel):
    scientific_name: str
    common_names: List[str]
    family: str
    genus: str
    score: float
    gbif_id: Optional[str] = None
    powo_id: Optional[str] = None


class IdentificationResult(BaseModel):
    best_match: str
    top_result: PlantMatch
    remaining_requests: int
