import { Joint } from './rig/Joint';
import { SwapSlot } from './rig/SwapSlot';
import { useKitoState } from '../../hooks/useKitoState';
import { palette, viewBox } from '../../tokens/kito';

import { useKitoContext } from './rig/KitoContext';

export function Kito() {
  const { hand, mouth, brows } = useKitoContext();

  return (
    <svg
      viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMax meet"
      role="img"
      aria-label="Kito, the SkilledLink construction worker mascot"
    >
      <g id="worker">

        {/* ============ LEGS ============ */}
        <Joint name="leg_right" id="leg_right">
          <g id="thigh_right">
            <path d="M156 395 L200 395 L197 540 L159 540 Z" fill={palette.blue} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
          </g>
          <Joint name="shin_right" id="shin_right">
            <path d="M159 540 L197 540 L195 645 L162 645 Z" fill={palette.blue} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
            <rect x={159} y={580} width={38} height={10} fill={palette.grayLight} stroke={palette.outline} strokeWidth={2}/>
          </Joint>
          <Joint name="boot_right" id="boot_right">
            <path d="M162 640 L196 640 L200 675 Q195 681 178 681 Q160 681 158 675 Z" fill={palette.boot} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
            <path d="M158 670 L200 670 L200 678 Q195 682 178 682 Q160 682 158 678 Z" fill={palette.outline}/>
          </Joint>
        </Joint>

        <Joint name="leg_left" id="leg_left">
          <g id="thigh_left">
            <path d="M200 395 L244 395 L241 540 L203 540 Z" fill={palette.blue} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
          </g>
          <Joint name="shin_left" id="shin_left">
            <path d="M203 540 L241 540 L238 645 L205 645 Z" fill={palette.blue} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
            <rect x={203} y={580} width={38} height={10} fill={palette.grayLight} stroke={palette.outline} strokeWidth={2}/>
          </Joint>
          <Joint name="boot_left" id="boot_left">
            <path d="M204 640 L238 640 L242 675 Q237 681 220 681 Q202 681 200 675 Z" fill={palette.boot} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
            <path d="M200 670 L242 670 L242 678 Q237 682 220 682 Q202 682 200 678 Z" fill={palette.outline}/>
          </Joint>
        </Joint>

        {/* ============ BLUEPRINT ============ */}
        <Joint name="blueprint" id="blueprint">
          <g transform="translate(230 415) rotate(-12)">
            <rect x={-38} y={-28} width={76} height={56} rx={3} fill="#F1F5F9" stroke={palette.gray} strokeWidth={2.5}/>
            <g fill="none" stroke="#64748B" strokeWidth={2} strokeLinecap="round">
              <path d="M-30 -20 L8 -20 L8 16 L-30 16 Z"/>
              <path d="M8 -20 L22 -20 L22 16 L8 16"/>
              <path d="M-30 0 L8 0"/>
              <path d="M-12 -20 L-12 0"/>
              <path d="M-30 20 L22 20"/>
              <path d="M-30 17 L-30 23"/>
              <path d="M22 17 L22 23"/>
            </g>
          </g>
        </Joint>

        {/* ============ ARMS ============ */}
        <Joint name="arm_right" id="arm_right">
          <g id="upper_arm_right">
            <path d="M125 210 Q115 220 116 250 L118 305 L148 305 L147 245 Q145 218 148 208 Z" fill={palette.blue} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
          </g>
          <Joint name="forearm_right" id="forearm_right">
            <path d="M118 305 L148 305 L146 400 L120 400 Z" fill={palette.skin} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
          </Joint>
          <g id="sleeve_right">
            <rect x={116} y={295} width={34} height={18} fill={palette.blue} stroke={palette.outline} strokeWidth={3}/>
          </g>
          <Joint name="hand_right" id="hand_right">
            <SwapSlot active={hand}>
              {{
                grip: (
                  <path d="M118 400 Q118 418 125 425 Q132 432 142 430 Q150 428 150 415 L148 400 Z"
                        fill={palette.gray} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
                ),
                point: (
                  <path d="M120 400 L148 400 L148 415 Q150 425 158 428 L172 432 Q180 430 178 424 L160 415 L148 405 L148 400 Z"
                        fill={palette.gray} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
                ),
                thumbsup: (
                  <>
                    <path d="M118 400 L148 400 L148 430 Q140 438 128 435 Q118 428 118 415 Z"
                          fill={palette.gray} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
                    <path d="M138 400 L138 380 Q140 372 148 374 Q152 380 150 390 L148 400 Z"
                          fill={palette.gray} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
                  </>
                ),
              }}
            </SwapSlot>
          </Joint>
        </Joint>

        <Joint name="arm_left" id="arm_left">
          <g id="upper_arm_left">
            <path d="M275 210 Q285 220 284 250 L282 305 L252 305 L253 245 Q255 218 252 208 Z" fill={palette.blue} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
          </g>
          <Joint name="forearm_left" id="forearm_left">
            <path d="M252 305 L282 305 L275 395 L248 395 Z" fill={palette.skin} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
          </Joint>
          <g id="sleeve_left">
            <rect x={250} y={295} width={34} height={18} fill={palette.blue} stroke={palette.outline} strokeWidth={3}/>
          </g>
          <Joint name="hand_left" id="hand_left">
            <path d="M248 395 Q246 412 250 422 Q256 432 268 432 Q278 430 278 418 L275 395 Z"
                  fill={palette.gray} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
          </Joint>
        </Joint>

        {/* ============ NECK ============ */}
        <g id="neck">
          <rect x={185} y={172} width={30} height={35} fill={palette.skin} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
        </g>

        {/* ============ TORSO ============ */}
        <Joint name="torso" id="torso">
          <g id="shirt_body">
            <path d="M200 200 Q165 205 148 215 Q135 230 135 265 L142 375 L258 375 L265 265 Q265 230 252 215 Q235 205 200 200 Z"
                  fill={palette.blue} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
          </g>
          <g id="vest">
            <path d="M160 218 Q180 212 200 212 Q220 212 240 218 L246 260 L246 372 L154 372 L154 260 Z"
                  fill={palette.yellow} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
          </g>
          <g id="vest_stripes">
            <rect x={160} y={252} width={80} height={10} fill={palette.grayLight} stroke={palette.outline} strokeWidth={2}/>
            <rect x={160} y={345} width={80} height={10} fill={palette.grayLight} stroke={palette.outline} strokeWidth={2}/>
            <rect x={160} y={218} width={10} height={154} fill={palette.grayLight} stroke={palette.outline} strokeWidth={2}/>
            <rect x={230} y={218} width={10} height={154} fill={palette.grayLight} stroke={palette.outline} strokeWidth={2}/>
          </g>
          <g id="utility_belt">
            <rect x={142} y={370} width={116} height={30} fill={palette.gray} stroke={palette.outline} strokeWidth={3}/>
            <rect x={188} y={376} width={24} height={20} rx={3} fill={palette.grayLight} stroke={palette.outline} strokeWidth={2}/>
            <rect x={155} y={385} width={22} height={38} rx={3} fill={palette.gray} stroke={palette.outline} strokeWidth={3}/>
            <rect x={223} y={385} width={22} height={34} rx={3} fill={palette.gray} stroke={palette.outline} strokeWidth={3}/>
          </g>
        </Joint>

        {/* ============ COLLAR ============ */}
        <g id="collar">
          <path d="M178 205 Q188 222 200 222 Q212 222 222 205 Q228 210 228 220 Q214 232 200 232 Q186 232 172 220 Q172 210 178 205 Z"
                fill={palette.blue} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
        </g>

        {/* ============ HEAD ============ */}
        <Joint name="head" id="head">
          <g id="ears">
            <ellipse cx={160} cy={120} rx={8} ry={14} fill={palette.skin} stroke={palette.outline} strokeWidth={3}/>
            <ellipse cx={240} cy={120} rx={8} ry={14} fill={palette.skin} stroke={palette.outline} strokeWidth={3}/>
          </g>
          <g id="face_base">
            <path d="M200 60 Q238 60 240 105 Q240 145 232 168 Q220 185 200 185 Q180 185 168 168 Q160 145 160 105 Q162 60 200 60 Z"
                  fill={palette.skin} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
          </g>
          <g id="nose">
            <path d="M198 125 Q193 140 195 148 Q200 153 205 148 Q207 140 202 125 Z" fill={palette.skinShadow}/>
          </g>
          <g id="mustache">
            <path d="M182 155 Q192 148 208 148 Q218 155 218 162 Q208 165 200 162 Q192 165 182 162 Z" fill={palette.beard}/>
          </g>
          <g id="beard">
            <path d="M168 140 Q165 165 175 178 Q190 188 200 188 Q210 188 225 178 Q235 165 232 140 Q230 158 224 168 Q212 176 200 176 Q188 176 176 168 Q170 158 168 140 Z"
                  fill={palette.beard} stroke={palette.outline} strokeWidth={2.5} strokeLinejoin="round"/>
          </g>
          <SwapSlot active={mouth}>
            {{
              smile: <path d="M188 165 Q200 176 212 165 Q206 170 194 170 Z" fill="#F1F5F9" stroke={palette.outline} strokeWidth={2} strokeLinejoin="round"/>,
              open: <ellipse cx={200} cy={169} rx={12} ry={7} fill="#F1F5F9" stroke={palette.outline} strokeWidth={2}/>,
              flat: <path d="M189 167 Q200 167 211 167" fill="none" stroke={palette.outline} strokeWidth={2.5} strokeLinecap="round"/>,
            }}
          </SwapSlot>

          <g id="eye_left">
            <path id="sclera_left" d="M170 112 Q180 105 190 112 Q180 119 170 112 Z" fill={palette.white} stroke={palette.outline} strokeWidth={2.5} strokeLinejoin="round"/>
            <Joint name="pupil_left" id="pupil_left">
              <circle cx={181} cy={112} r={4} fill={palette.outline}/>
              <circle cx={182.5} cy={110.5} r={1.4} fill="#FFFFFF"/>
            </Joint>
          </g>
          <g id="eye_right">
            <path id="sclera_right" d="M210 112 Q220 105 230 112 Q220 119 210 112 Z" fill={palette.white} stroke={palette.outline} strokeWidth={2.5} strokeLinejoin="round"/>
            <Joint name="pupil_right" id="pupil_right">
              <circle cx={219} cy={112} r={4} fill={palette.outline}/>
              <circle cx={220.5} cy={110.5} r={1.4} fill="#FFFFFF"/>
            </Joint>
          </g>

          <g id="eyelid_left" opacity={0}>
            <path d="M169 112 Q180 104 191 112 Q180 120 169 112 Z" fill={palette.skin}/>
            <path d="M169 112 Q180 118 191 112" fill="none" stroke={palette.outline} strokeWidth={2.5} strokeLinecap="round"/>
          </g>
          <g id="eyelid_right" opacity={0}>
            <path d="M209 112 Q220 104 231 112 Q220 120 209 112 Z" fill={palette.skin}/>
            <path d="M209 112 Q220 118 231 112" fill="none" stroke={palette.outline} strokeWidth={2.5} strokeLinecap="round"/>
          </g>

          <SwapSlot active={brows}>
            {{
              neutral: (
                <>
                  <g id="brow_left"><path d="M167 100 Q178 95 189 100" fill="none" stroke={palette.beard} strokeWidth={4.5} strokeLinecap="round"/></g>
                  <g id="brow_right"><path d="M211 100 Q222 95 233 100" fill="none" stroke={palette.beard} strokeWidth={4.5} strokeLinecap="round"/></g>
                </>
              ),
              raised: (
                <>
                  <path d="M167 94 Q178 88 189 94" fill="none" stroke={palette.beard} strokeWidth={4.5} strokeLinecap="round"/>
                  <path d="M211 94 Q222 88 233 94" fill="none" stroke={palette.beard} strokeWidth={4.5} strokeLinecap="round"/>
                </>
              ),
              furrowed: (
                <>
                  <path d="M167 102 L189 97" fill="none" stroke={palette.beard} strokeWidth={4.5} strokeLinecap="round"/>
                  <path d="M233 102 L211 97" fill="none" stroke={palette.beard} strokeWidth={4.5} strokeLinecap="round"/>
                </>
              ),
            }}
          </SwapSlot>

          <Joint name="helmet" id="helmet">
            <path id="helmet_dome" d="M150 100 Q150 45 200 45 Q250 45 250 100 Z" fill={palette.yellow} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
            <path id="helmet_shade" d="M200 45 Q250 45 250 100 L235 100 Q235 58 200 55 Z" fill={palette.yellowDark} opacity={0.6}/>
            <path id="helmet_ridge" d="M196 46 L204 46 L202 100 L198 100 Z" fill={palette.yellowLight}/>
            <path id="helmet_brim" d="M140 96 Q150 90 200 90 Q250 90 260 96 Q252 108 200 108 Q148 108 140 96 Z" fill={palette.yellow} stroke={palette.outline} strokeWidth={3} strokeLinejoin="round"/>
          </Joint>
        </Joint>

      </g>
    </svg>
  );
}