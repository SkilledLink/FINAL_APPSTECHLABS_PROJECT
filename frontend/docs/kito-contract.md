# Kito — Asset Contract

Any file claiming to be Kito must satisfy this document.

## viewBox

`0 0 400 700` — locked. Every part file uses it. 1 unit = 1px at 300px render height.

## Coordinate space

Origin top-left. Character centered at x=200. Feet at y=680.

## Group ids

Case-sensitive. Must appear exactly as written.

    worker
    ├── helmet
    │   ├── helmet_dome
    │   ├── helmet_shade
    │   ├── helmet_ridge
    │   └── helmet_brim
    ├── head
    │   ├── ears
    │   ├── face_base
    │   ├── nose
    │   ├── beard
    │   ├── mustache
    │   ├── mouth
    │   ├── eye_left
    │   │   ├── sclera_left
    │   │   └── pupil_left
    │   ├── eye_right
    │   │   ├── sclera_right
    │   │   └── pupil_right
    │   ├── eyelid_left
    │   ├── eyelid_right
    │   ├── brow_left
    │   └── brow_right
    ├── neck
    ├── torso
    │   ├── shirt_body
    │   ├── vest
    │   ├── vest_stripes
    │   └── utility_belt
    ├── collar
    ├── arm_left
    │   ├── upper_arm_left
    │   ├── forearm_left
    │   ├── sleeve_left
    │   └── hand_left
    ├── arm_right
    │   ├── upper_arm_right
    │   ├── forearm_right
    │   ├── sleeve_right
    │   └── hand_right
    ├── blueprint
    ├── leg_left
    │   ├── thigh_left
    │   ├── shin_left
    │   └── boot_left
    └── leg_right
        ├── thigh_right
        ├── shin_right
        └── boot_right

## Pivot table

`transform-origin` for each animatable group, in viewBox units.

| Group | x | y |
|---|---|---|
| head | 200 | 190 |
| helmet | 200 | 100 |
| torso | 200 | 375 |
| arm_left | 255 | 212 |
| arm_right | 145 | 212 |
| forearm_left | 267 | 305 |
| forearm_right | 133 | 305 |
| hand_left | 263 | 400 |
| hand_right | 133 | 400 |
| leg_left | 222 | 395 |
| leg_right | 178 | 395 |
| shin_left | 222 | 540 |
| shin_right | 178 | 540 |
| boot_left | 222 | 645 |
| boot_right | 178 | 645 |
| blueprint | 230 | 415 |
| pupil_left | 181 | 112 |
| pupil_right | 219 | 112 |

## Swap slots

Each slot has a default plus variants. Variants share the default's anchor coordinate so they overlay without repositioning.

| Slot | Default | Variants | Anchor |
|---|---|---|---|
| hand_right | grip | point, thumbsup | 133, 400 |
| mouth | smile | open, flat | 200, 168 |
| brows | neutral | raised, furrowed | 200, 100 |

Swap variants ship as sibling groups inside the same parent, controlled by opacity.

## Palette

| Token | Hex | Use |
|---|---|---|
| blue | #1E40AF | shirt, pants |
| blueDark | #0F172A | deepest shadows |
| yellow | #FBBF24 | helmet, vest |
| yellowDark | #D97706 | helmet shade |
| yellowLight | #FDE68A | helmet ridge |
| gray | #334155 | belt, gloves |
| grayLight | #E5E7EB | vest stripes, pant stripes |
| white | #F8FAFC | sclera |
| boot | #B45309 | boots |
| outline | #0F172A | all strokes |
| skin | #8A5A3A | face base |
| skinShadow | #6B4229 | nose, shadow |
| skinHighlight | #A97350 | reserved |
| beard | #2B1F17 | beard, hair, brows |

No logo. No text. No watermark. No brand mark anywhere.

## Constraints

- Transparent background
- No ground, no cast shadow extending beyond the feet
- No scene, no background objects
- Vector only — no raster fills, no embedded images
- Uniform outline: `#0F172A`, 3 units on body, 2.5 on face, 2 on fine detail
- Rounded caps and joins throughout
- No 3D-implying gradients (flat shading only)

## Silhouette test

Fill every path with `#000`, render at 180px tall. The following must read as distinct shapes:
- Helmet brim
- Beard
- Blueprint rectangle
- Belt buckle
- Boot silhouette

If any of these vanish, the part is too small or too close to a neighbour.

## File naming

- Master: `kito.svg`
- Parts: `part-name.svg` — kebab-case, matches group id with hyphens
- Swaps: `swap/part-name-variant.svg`

## Versioning

Every file carries a sibling `.meta.json`:

    { "version": "1.0.0", "contract": "1.0.0", "generator": "placeholder|artist-name" }

Mismatched contract versions block the swap.