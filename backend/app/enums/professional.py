from enum import Enum

class DurationUnit(str, Enum):
    MINUTES = "minutes"
    HOURS = "hours"
    DAYS = "days"
    WEEKS = "weeks"
    MONTHS = "months"

class ClientType(str, Enum):
    INDIVIDUAL = "individual"
    HOUSEHOLD = "household"
    BUSINESS = "business"
    ORGANIZATION = "organization"
    GOVERNMENT = "government"
    PROFESSIONAL = "professional"
    CONTRACTOR = "contractor"

class PricingType(str, Enum):
    FIXED = "fixed"
    STARTING_FROM = "starting_from"
    HOURLY = "hourly"
    DAILY = "daily"
    QUOTE_REQUIRED = "quote_required"

class AvailabilityDay(str, Enum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"