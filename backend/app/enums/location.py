# app/enums/location.py

from enum import Enum


class LocationType(str, Enum):
    HOME = "home"
    OFFICE = "office"
    WORKSHOP = "workshop"
    OTHER = "other"


class ServiceAreaStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"