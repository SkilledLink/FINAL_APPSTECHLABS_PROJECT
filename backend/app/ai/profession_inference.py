# app/ai/profession_inference.py
"""
Map service-description language to a canonical profession.

The intent classifier and chat service both use this so a query like
"I need someone to wire my house" is understood as an Electrician
search, even though the user never said the word "electrician".

Design rules:
  • Keys are lowercase, canonical profession names as they appear in
    the `professionals.profession` column.
  • Values are lowercase keyword phrases — matched as whole words so
    "wire" doesn't accidentally fire on "wired differently".
  • Every mapping is deterministic. No ML. <1 ms per call.
  • New professions / keywords can be appended without touching
    classification logic.
"""

from __future__ import annotations

import re
from typing import Optional


# ─── Canonical profession names ─────────────────────────────────

ELECTRICIAN  = "Electrician"
PLUMBER      = "Plumber"
CARPENTER    = "Carpenter"
MASON        = "Mason"
WELDER       = "Welder"
ROOFER       = "Roofer"
PAINTER      = "Painter"
MECHANIC     = "Mechanic"
TILER        = "Tiler"
GARDENER     = "Gardener"
CLEANER      = "Cleaner"
TAILOR       = "Tailor"
HAIRDRESSER  = "Hairdresser"
DRIVER       = "Driver"
DEVELOPER    = "Developer"
DESIGNER     = "Designer"
PHOTOGRAPHER = "Photographer"


# ─── Service-keyword → profession ──────────────────────────────

SERVICE_TO_PROFESSION: dict[str, set[str]] = {
    ELECTRICIAN: {
        # profession name itself
        "electrician", "electricians",
        # wiring & fixtures
        "wire", "wires", "wiring", "rewire", "rewiring", "electrical",
        "socket", "sockets", "outlet", "outlets", "switch", "switches",
        "breaker", "breakers", "fuse", "fuses", "panel", "circuit",
        "light", "lights", "lighting", "ceiling fan", "chandelier",
        # power issues
        "power outage", "power cut", "short circuit", "no power",
        "electricity", "electrical fault", "tripping",
        # french
        "électricité", "installation électrique", "câblage",
        "prise", "prises", "interrupteur", "court-circuit",
    },
    PLUMBER: {
        "plumber", "plumbers",
        "pipe", "pipes", "pipework", "plumbing", "plumb",
        "drain", "drains", "drainage", "sewage", "sewer", "septic",
        "faucet", "faucets", "tap", "taps", "sink", "sinks", "basin",
        "toilet", "toilets", "wc", "shower", "showers",
        "bathtub", "bidet",
        "water heater", "boiler", "geyser",
        "leak", "leaks", "leaking", "leaky",
        "clog", "clogs", "clogged", "blockage",
        "burst pipe", "flooding", "water damage",
        "plomberie", "plombier", "tuyau", "tuyaux", "fuite",
        "robinet", "évier", "toilette", "chauffe-eau",
    },
    CARPENTER: {
        "carpenter", "carpenters",
        "carpentry", "wood", "wooden", "timber",
        "furniture", "cabinet", "cabinets", "wardrobe", "wardrobes",
        "closet", "closets",
        "door", "doors", "window frame", "window frames",
        "shelf", "shelves", "shelving", "table", "tables",
        "chair", "chairs", "bed", "beds", "desk", "desks",
        "charpenterie", "charpentier", "bois", "meuble",
        "porte", "fenêtre", "étagère",
    },
    MASON: {
        "mason", "masons",
        "masonry", "brick", "bricks", "block", "blocks",
        "concrete", "cement", "mortar", "plaster", "plastering",
        "wall", "walls", "foundation", "foundations",
        "floor", "floors", "flooring", "slab",
        "maçonnerie", "maçon", "brique", "briques", "ciment",
        "mur", "murs", "fondation", "dalle",
    },
    WELDER: {
        "welder", "welders",
        "weld", "welds", "welding",
        "metalwork", "metal work", "metal", "iron", "steel",
        "stainless",
        "gate", "gates", "railing", "railings", "fence", "fences",
        "fencing", "grill", "grille", "grilles", "frame", "frames",
        "soudure", "soudeur", "métal", "fer", "portail",
        "clôture",
    },
    ROOFER: {
        "roofer", "roofers",
        "roof", "roofs", "roofing", "roof leak", "roof leaks",
        "roof repair", "roof repairs",
        "shingle", "shingles",
        "gutter", "gutters", "ceiling", "ceilings",
        "toiture", "toit", "gouttière", "plafond",
    },
    PAINTER: {
        "painter", "painters",
        "paint", "paints", "painting", "repaint", "repainting",
        "wall paint", "wall painting", "coat", "coating",
        "primer", "primer coat", "varnish", "lacquer",
        "peinture", "peindre", "peintre", "repeindre", "vernis",
    },
    MECHANIC: {
        "mechanic", "mechanics",
        "car", "cars", "vehicle", "vehicles", "auto", "automobile",
        "engine", "engines", "motor", "motors",
        "transmission", "brake", "brakes",
        "tire", "tires", "tyre", "tyres",
        "battery", "batteries",
        "oil change", "car repair", "car repairs",
        "vehicle repair", "vehicle repairs",
        "mécanicien", "mécanique", "voiture", "moteur",
        "frein", "pneu", "batterie", "réparation",
    },
    TILER: {
        "tiler", "tilers",
        "tile", "tiles", "tiling",
        "floor tile", "floor tiles", "wall tile", "wall tiles",
        "bathroom tile", "bathroom tiles",
        "kitchen tile", "kitchen tiles",
        "carrelage", "carreau", "carreaux",
    },
    GARDENER: {
        "gardener", "gardeners",
        "garden", "gardens", "gardening",
        "lawn", "lawns", "grass",
        "hedge", "hedges", "tree", "trees",
        "plant", "plants",
        "landscaping", "landscape",
        "jardin", "jardinage", "jardinier", "pelouse",
        "haie", "arbre", "plante", "paysagiste",
    },
    CLEANER: {
        "cleaner", "cleaners",
        "clean", "cleans", "cleaning",
        "housekeeping", "maid", "janitor",
        "deep clean", "deep cleaning",
        "ménage", "nettoyage",
    },
    TAILOR: {
        "tailor", "tailors",
        "tailoring", "sew", "sewing",
        "seamstress", "seamster",
        "dress", "dresses", "suit", "suits",
        "alteration", "alterations", "hem", "hemming",
        "couturier", "couturière", "couture", "tailleur",
        "robe", "costume", "retouche",
    },
    HAIRDRESSER: {
        # profession name and every common spelling
        "hairdresser", "hairdressers",
        "hair dresser", "hair dressers",
        "hair-dresser", "hair-dressers",
        "hairstylist", "hairstylists",
        "hair stylist", "hair stylists",
        # services
        "hair", "hairs",
        "haircut", "haircuts", "hair cut", "hair cuts",
        "hair style", "hair styling", "hairstyle",
        "barber", "barbers", "barbershop", "barber shop",
        "braid", "braids", "braiding", "hair braiding",
        "weave", "weaves", "weaving", "hair weaving",
        "wig", "wigs",
        # french
        "coiffeur", "coiffeuse", "coiffure",
        "tresse", "tresses", "tressage",
        "perruque", "barbier",
    },
    DRIVER: {
        "driver", "drivers",
        "drive", "driving", "chauffeur",
        "moving", "movers", "transport", "delivery", "deliver",
        "logistics", "truck", "trucks", "van", "vans",
        "conducteur", "livraison", "déménagement",
    },
    DEVELOPER: {
        "developer", "developers",
        "code", "coding",
        "programmer", "programmers", "software",
        "website", "web site", "web app", "web apps",
        "backend", "frontend", "fullstack", "full-stack",
        "api", "database", "mobile app", "mobile apps",
        "développeur", "programmeur", "site web", "logiciel",
    },
    DESIGNER: {
        "designer", "designers",
        "design",
        "graphic design", "logo", "logos",
        "branding", "ux", "ui", "ux/ui",
        "poster", "posters", "flyer", "flyers",
        "illustration", "illustrations",
        "graphiste", "affiche",
    },
    PHOTOGRAPHER: {
        "photographer", "photographers",
        "photo", "photos", "photograph", "photographs",
        "photography", "shoot", "shoots", "photoshoot",
        "portrait", "portraits",
        "wedding photos", "event photos",
        "photographe", "photographie",
    },
}


# ─── Pre-compiled matchers ─────────────────────────────────────

def _build_pattern(phrase: str) -> re.Pattern[str]:
    escaped = re.escape(phrase.strip())
    escaped = escaped.replace(r"\ ", r"\s+")
    return re.compile(rf"(?<!\w){escaped}(?!\w)", re.IGNORECASE)


_MATCHERS: list[tuple[str, re.Pattern[str]]] = []
for _prof, _phrases in SERVICE_TO_PROFESSION.items():
    for _phrase in _phrases:
        _MATCHERS.append((_prof, _build_pattern(_phrase)))


# ─── Public API ────────────────────────────────────────────────

def infer_profession(text: str) -> Optional[str]:
    """
    Return the canonical profession best matching `text`, or None.

    Matching strategy:
      • Scan every phrase matcher.
      • Return the profession whose keyword appears earliest in the
        text — the dominant subject of the sentence wins.
      • Longer keyword wins on a tie (more specific signal).
    """
    if not text:
        return None

    cleaned = text.strip()
    if not cleaned:
        return None

    best: Optional[tuple[int, int, str]] = None
    for prof, pattern in _MATCHERS:
        m = pattern.search(cleaned)
        if not m:
            continue
        pos = m.start()
        length = m.end() - m.start()
        score = (pos, -length)
        if best is None or score < best[:2]:
            best = (pos, -length, prof)

    return best[2] if best else None


def infer_profession_for_search(text: str) -> Optional[str]:
    """
    Like `infer_profession` but returns None for very short messages
    that are more likely to be greetings or acknowledgements.
    """
    if not text:
        return None
    tokens = text.split()
    if len(tokens) < 1:
        return None
    return infer_profession(text)