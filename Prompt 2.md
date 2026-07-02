🚀 UNIVERSAL REMOTION PROMPT FRAMEWORK
The Master Template for High-Quality Motion Graphics Prompts

📋 WHAT THIS IS
A meta-prompt system that lets you generate professional-grade Remotion animations for ANY concept by filling in template variables. Instead of writing from scratch, you fill in key parameters and get production-ready prompts.
This framework is based on:
✅ Proven prompt engineering best practices
✅ Systematic prompt architecture
✅ Real working examples (coffee, to-do app, India map)
✅ Meta-prompting (Claude writes prompts for Claude)

🎯 THE UNIVERSAL FRAMEWORK
FILL-IN-THE-BLANKS TEMPLATE
Copy this entire structure and fill in each {{VARIABLE}}:
You are creating a {{DURATION}}-second {{STYLE}} motion graphics video for {{PROJECT_NAME}} using Remotion.

This must feel like {{INSPIRATION_1}} meets {{INSPIRATION_2}} meets {{INSPIRATION_3}} - {{EMOTIONAL_TONE}}.

CRITICAL REQUIREMENTS:
1. Duration: {{FRAME_COUNT}} frames at 30fps ({{DURATION}} seconds exactly)
2. Use spring() animations with damping: {{DAMPING_RANGE}} ({{PHYSICS_FEEL}})
3. {{SIMULTANEOUS_ELEMENTS_INSTRUCTION}}
4. Pacing: {{PACING_SPEED}} - scenes change every {{SCENE_CHANGE_TIME}}
5. Visual style: {{COLOR_MOOD}}, {{TEXTURE_STYLE}}
6. All interpolate() must have extrapolateRight: 'clamp'

BRAND IDENTITY:
- {{PROJECT_TYPE}}: {{PROJECT_NAME}}
- Tagline/Purpose: {{PROJECT_TAGLINE}}
- Primary Audience: {{TARGET_AUDIENCE}}
- Brand Archetype: {{BRAND_ARCHETYPE}}
- Color Scheme:
  - Primary: {{COLOR_PRIMARY}} ({{COLOR_PRIMARY_HEX}})
  - Secondary: {{COLOR_SECONDARY}} ({{COLOR_SECONDARY_HEX}})
  - Accent: {{COLOR_ACCENT}} ({{COLOR_ACCENT_HEX}})
  - Background: {{COLOR_BG}} ({{COLOR_BG_HEX}})
  - Text: {{COLOR_TEXT}} ({{COLOR_TEXT_HEX}})

==== SCENE 1: {{SCENE_1_NAME}} (Frames 0-{{SCENE_1_END}} | 0-{{SCENE_1_TIME}} seconds) ====

Background:
{{SCENE_1_BG_DESCRIPTION}}

Main Element(s):
{{SCENE_1_ELEMENTS_DESCRIPTION}}

Animation Type: {{SCENE_1_ANIMATION_TYPE}}

Technical Details:
{{SCENE_1_TECHNICAL_DETAILS}}

Animation Code Pattern:
{{SCENE_1_CODE_PATTERN}}

Hold: frames {{SCENE_1_HOLD_START}}-{{SCENE_1_HOLD_END}}

==== SCENE 2: {{SCENE_2_NAME}} (Frames {{SCENE_1_END}}-{{SCENE_2_END}} | {{SCENE_1_TIME}}-{{SCENE_2_TIME}} seconds) ====

{{REPEAT_SCENE_STRUCTURE_FOR_ALL_SCENES}}

==== TECHNICAL SPECIFICATIONS ====

EASING FUNCTIONS TO USE:
- Entry animations: {{ENTRY_EASING}}
- Smooth transitions: {{TRANSITION_EASING}}
- Bounces: {{BOUNCE_EASING}}
- Exits: {{EXIT_EASING}}

COLOR PALETTE (Use exactly):
- {{COLOR_NAME_1}}: {{COLOR_HEX_1}}
- {{COLOR_NAME_2}}: {{COLOR_HEX_2}}
- {{COLOR_NAME_3}}: {{COLOR_HEX_3}}
- {{COLOR_NAME_4}}: {{COLOR_HEX_4}}
- {{COLOR_NAME_5}}: {{COLOR_HEX_5}}

TYPOGRAPHY:
- Hero: {{FONT_HERO_SIZE}}px, {{FONT_HERO_WEIGHT}}, tracking: {{FONT_HERO_TRACKING}}
- Large: {{FONT_LARGE_SIZE}}px, {{FONT_LARGE_WEIGHT}}, tracking: {{FONT_LARGE_TRACKING}}
- Medium: {{FONT_MEDIUM_SIZE}}px, {{FONT_MEDIUM_WEIGHT}}, tracking: {{FONT_MEDIUM_TRACKING}}
- Body: {{FONT_BODY_SIZE}}px, {{FONT_BODY_WEIGHT}}, tracking: {{FONT_BODY_TRACKING}}

ANIMATION PATTERNS TO USE:
{{ANIMATION_PATTERN_1_DESCRIPTION}}
{{ANIMATION_PATTERN_2_DESCRIPTION}}
{{ANIMATION_PATTERN_3_DESCRIPTION}}

VISUAL EFFECTS:
{{EFFECT_1_NAME}}: {{EFFECT_1_DESCRIPTION}}
{{EFFECT_2_NAME}}: {{EFFECT_2_DESCRIPTION}}
{{EFFECT_3_NAME}}: {{EFFECT_3_DESCRIPTION}}

DELIVERABLE CODE MUST INCLUDE:
1. {{DELIVERABLE_1}}
2. {{DELIVERABLE_2}}
3. {{DELIVERABLE_3}}
4. {{DELIVERABLE_4}}
5. {{DELIVERABLE_5}}
6. {{DELIVERABLE_6}}
7. {{DELIVERABLE_7}}
8. {{DELIVERABLE_8}}
9. {{DELIVERABLE_9}}
10. {{DELIVERABLE_10}}

RENDER COMMAND:
npx remotion render output.mp4 --codec h264 --crf 18


🎬 VARIABLE DEFINITIONS & EXAMPLES
TIMING VARIABLES
text
{{DURATION}}
- Examples: 15, 20, 24, 30 seconds
- Use: Total video length

{{FRAME_COUNT}}
- Formula: {{DURATION}} * 30
- Examples: 450 (15s), 600 (20s), 720 (24s)

{{SCENE_CHANGE_TIME}}
- Examples: 3 seconds, 4-5 seconds, 5-7 seconds
- Use: How fast scenes transition (impacts energy)

{{DAMPING_RANGE}}
- Conservative: 150-200 (smooth, professional)
- Moderate: 120-150 (balanced)
- Aggressive: 80-120 (snappy, energetic)
- Explosive: 50-80 (maximum impact)

STYLE VARIABLES
text
{{STYLE}}
- Examples: high-impact motion graphics, documentary, minimalist, kinetic, explosive

{{INSPIRATION_1}}, {{INSPIRATION_2}}, {{INSPIRATION_3}}
- Examples: 
  - Apple product launches
  - Netflix title sequences
  - Spotify Wrapped
  - National Geographic
  - Discovery Channel
  - Inside Geopolitics
  - TED talks
  - Nike commercials

{{EMOTIONAL_TONE}}
- Examples: professional yet accessible, energetic, sophisticated, aspirational, bold

{{PACING_SPEED}}
- Examples: fast-paced, moderate, slow and deliberate, syncopated

{{COLOR_MOOD}}
- Examples: warm and inviting, cold and professional, vibrant and modern, dark and luxe

ANIMATION VARIABLES
text
{{SIMULTANEOUS_ELEMENTS_INSTRUCTION}}
- Conservative: "One element at a time - NO simultaneous animations"
- Moderate: "Multiple elements CAN animate sequentially (not simultaneously)"
- Aggressive: "Multiple elements CAN animate simultaneously (this is intentional for impact)"

{{ENTRY_EASING}}
- spring({damping: 120}) - for bouncy entries
- Easing.out(Easing.quad) - for smooth deceleration
- Easing.back(1.5) - for anticipatory motion
- Easing.out(Easing.elastic) - for spring-like bounce

{{BOUNCE_EASING}}
- spring({damping: 100, mass: 0.5}) - snappy
- spring({damping: 150, mass: 0.8}) - moderate
- spring({damping: 200, mass: 1.0}) - smooth

VISUAL VARIABLES
text
{{COLOR_PRIMARY_HEX}}, {{COLOR_SECONDARY_HEX}}, etc.
- Format: #RRGGBB (hex color codes)
- Examples:
  - #136152 
  - #44803F 
  - #B4CF66 (its name)
  - #FFEC5C
  - #FF5A33
  - White (if needed)
  - Black as needed
  - Red (if needed)

{{TEXTURE_STYLE}}
- Examples: glossy gradient, matte, metallic, glass-morphism, subtle noise

{{COLOR_MOOD}}
- Examples: luxurious and premium, energetic and vibrant, professional and corporate

{{FONT_HERO_WEIGHT}}
- Examples: bold, extra-bold, 900, 700


📝 FILLED EXAMPLE 1: SAAS PRODUCT LAUNCH
text
You are creating a 20-second high-impact motion graphics video for a productivity SaaS 
called "TaskFlow" using Remotion.

This must feel like Apple product launches meets Spotify Wrapped meets Motion App - 
energetic, modern, and aspirational.

CRITICAL REQUIREMENTS:
1. Duration: 600 frames at 30fps (20 seconds exactly)
2. Use spring() animations with damping: 80-120 (snappy, energetic bounces)
3. Multiple elements CAN animate simultaneously (this is intentional for impact)
4. Pacing: Fast-paced - scenes change every 4-5 seconds
5. Visual style: Dark with electric blue/purple/neon green accents, glossy gradient
6. All interpolate() must have extrapolateRight: 'clamp'

BRAND IDENTITY:
- Project Type: SaaS Application
- Name: TaskFlow
- Tagline: "Get Things Done. Effortlessly."
- Primary Audience: 25-40 year old professionals
- Brand Archetype: The Innovator
- Color Scheme:
  - Primary: Electric Blue (#0066FF)
  - Secondary: Vibrant Purple (#8B5CF6)
  - Accent: Neon Green (#00FF88)
  - Background: Deep Dark (#0A0A0F)
  - Text: Pure White (#FFFFFF)

==== SCENE 1: EXPLOSIVE LOGO REVEAL (Frames 0-90 | 0-3 seconds) ====

Background:
Deep dark space black with animated radial gradient pulsing from blue center

Main Elements:
Checkmark icon with 20-particle burst system

Animation Type: Scale explosion with rotation and particle burst

Technical Details:
- Icon scale: 0 → 1.5 → 1.0 with spring({damping: 100, mass: 0.5})
- Rotation: 360° during entry
- Particles: 20 circles burst radially, fade out
- Entry glow: boxShadow with blue halo

Animation Code Pattern:
const iconScale = spring(frame - 10, fps, {damping: 100, mass: 0.5});
const particles = Array from({length: 20}).map((_, i) => {
  const angle = (i * Math.PI * 2) / 20;
  const distance = interpolate(frame, [20, 60], [0, 300]);
  return {x: 960 + cos(angle) * distance, y: 540 + sin(angle) * distance};
});

Hold: frames 60-90

[... continue with remaining scenes ...]


🎯 QUICK FILL-IN GUIDE
Step 1: Define Core Metrics
How long? 15s, 20s, 30s?
What style? Energetic, professional, cinematic?
What energy? High-impact, subtle, explosive?
Step 2: Set Brand Identity
Brand/product name
Colors (pick 5 hex codes)
Target audience
Tagline or main message
Step 3: Plan Scenes
How many scenes? (3-5 typically)
What happens in each?
How long per scene?
What enters/exits?
Step 4: Choose Animation Style
Spring damping (80-200 range)
Simultaneous or sequential?
Easing functions
Effects (glow, shadow, gradient)
Step 5: Fill Template
Copy the universal template
Fill in all {{VARIABLES}}
Review for consistency
Paste into Claude
Step 6: Generate & Render
Claude generates Remotion code
Render: npx remotion render output.mp4 --codec h264 --crf 18

💡 REAL-WORLD USAGE EXAMPLES
Use Case 1: E-commerce Product
text
{{DURATION}} = 15 seconds
{{STYLE}} = premium lifestyle
{{INSPIRATION}} = Luxury brand ads, fashion shows, high-end retail
{{DAMPING_RANGE}} = 150-180 (smooth, luxury)
{{SIMULTANEOUS_ELEMENTS}} = One at a time
{{COLOR_SCHEME}} = Gold, black, white (luxury palette)

Use Case 2: Education Platform
text
{{DURATION}} = 20 seconds
{{STYLE}} = modern educational
{{INSPIRATION}} = TED talks, Khan Academy, Duolingo
{{DAMPING_RANGE}} = 120-150 (approachable, energetic)
{{SIMULTANEOUS_ELEMENTS}} = Sequential, not simultaneous
{{COLOR_SCHEME}} = Bright, friendly, accessible colors

Use Case 3: Enterprise Software
text
{{DURATION}} = 30 seconds
{{STYLE}} = professional corporate
{{INSPIRATION}} = Salesforce campaigns, Microsoft product launches
{{DAMPING_RANGE}} = 180-220 (smooth, professional)
{{SIMULTANEOUS_ELEMENTS}} = One element at a time
{{COLOR_SCHEME}} = Blues, grays, corporate palette

Use Case 4: Gaming/VR
text
{{DURATION}} = 20 seconds
{{STYLE}} = explosive 3D
{{INSPIRATION}} = Game trailers, action movies, VR experiences
{{DAMPING_RANGE}} = 80-100 (snappy, aggressive)
{{SIMULTANEOUS_ELEMENTS}} = Multiple simultaneous animations
{{COLOR_SCHEME}} = Neon, vibrant, high-contrast


🔧 COMMON VARIABLE COMBINATIONS
Conservative/Professional
text
Damping: 180-220
Simultaneous: One at a time
Easing: Easing.out(Easing.quad)
Pacing: 5-7 seconds per scene
Color: Corporate (blues, grays, whites)

Balanced/Modern
text
Damping: 120-150
Simultaneous: Sequential clusters
Easing: Easing.inOut(Easing.cubic)
Pacing: 4-5 seconds per scene
Color: Modern (vibrant primaries + accents)

Aggressive/Energetic
text
Damping: 80-120
Simultaneous: Multiple overlapping
Easing: spring({damping: 100})
Pacing: 3-4 seconds per scene
Color: Bold (neon, high contrast)

Luxury/Premium
text
Damping: 200+
Simultaneous: One element (slow reveal)
Easing: Easing.out(Easing.ease)
Pacing: 5-8 seconds per scene
Color: Gold, black, minimal


📊 VARIABLE QUICK-REFERENCE TABLE
Variable
Type
Examples
Range
DURATION
Integer
15, 20, 30
10-60s
FRAME_COUNT
Formula
DURATION * 30
N/A
DAMPING
Integer
100, 150, 200
50-250
COLOR HEX
String
#0066FF, #D4AF37
Any valid hex
FONT_SIZE
Integer
48, 64, 80
18-200px
SCENE_TIME
Float
3, 4.5, 5
1-10s
SIMULTANEOUS
Boolean
true, false
Yes/No
PACING
String
fast, moderate, slow
Qualitative


🎬 WORKFLOW: FROM FRAMEWORK TO VIDEO
text
1. Identify project type (SaaS, education, product, motion graphics, 3D, other, etc.)
2. Define duration (15s, 20s, 30s)
3. Choose inspiration (Nike, Apple, Netflix, etc.)
4. Set brand colors (5 hex codes)
5. Plan scenes (3-5 scenes, write 1-2 sentences each)
6. Fill template with variables
7. Paste into Claude Code
8. Claude generates Remotion TypeScript
9. Render: npx remotion render output.mp4
10. Share/upload to platforms


🚀 META-PROMPTING BONUS
If you want Claude to WRITE the filled template for you:
text
You are an expert Remotion prompt engineer. I'm creating a {{PROJECT_TYPE}} animation.

PROJECT BRIEF:
- Product: {{PRODUCT_NAME}}
- Duration: {{DURATION}} seconds
- Style: {{DESIRED_STYLE}}
- Colors: {{COLOR_REFS}}
- Message: {{KEY_MESSAGE}}

Using the Universal Remotion Framework, generate a complete, filled-in prompt 
that I can immediately paste into Claude Code to generate production-ready 
Remotion animation code.

The prompt should:
1. Include all {{VARIABLES}} properly filled
2. Have 4-5 detailed scenes with specific frame numbers
3. Include technical implementation details
4. Specify color palette and typography
5. Be copy-paste ready for Claude

Generate the complete filled template now.

This lets Claude WRITE your prompt ABOUT your prompt. Meta-inception for maximum quality.

✅ QUALITY CHECKLIST
Before pasting into Claude:
 All {{VARIABLES}} filled with no placeholders
 Frame numbers add up to total duration
 Colors are valid hex codes
 Damping values are in range (50-250)
 Scenes are 3-7 seconds each
 Inspiration references are specific
 Animation patterns are clear
 Deliverables list is complete
 No vague instructions ("make it look good")
 Ready to paste into Claude Code

# Allow_editing:
To allow editing, follow this docs (guide):
---
image: /generated/articles-docs-schemas.png
id: schemas
title: Defining a schema for your props
sidebar_label: Defining a schema
crumb: 'How To'
---

As an alternative to [using TypeScript types](/docs/parameterized-rendering) to define the shape of the props your component accepts, you may use [Zod](https://zod.dev/) to define a schema for your props. You may do so if you want to edit the props visually in the Remotion Studio.

## Prerequisites

If you want to use this feature, install `zod@3.22.3` and [`@remotion/zod-types`](/docs/zod-types) for Remotion-specific types:

```bash
npx remotion add @remotion/zod-types zod
```

## Defining a schema

To define a schema for your props, use [`z.object()`](https://zod.dev/?id=objects):

```tsx twoslash
import {z} from 'zod';

export const myCompSchema = z.object({
  propOne: z.string(),
  propTwo: z.string(),
});
```

Using `z.infer()`, you can turn the schema into a type:

```tsx twoslash
import {z} from 'zod';

export const myCompSchema = z.object({
  propOne: z.string(),
  propTwo: z.string(),
});
// ---cut---
export const MyComp: React.FC<z.infer<typeof myCompSchema>> = ({propOne, propTwo}) => {
  return (
    <div>
      props: {propOne}, {propTwo}
    </div>
  );
};
```

## Adding a schema to your composition

Use the [`schema`](/docs/composition#schema) prop to attach the schema to your [`<Composition>`](/docs/composition). Remotion will require you to specify matching [`defaultProps`](/docs/composition#schema).

```tsx twoslash title="src/Root.tsx" {3,14-18}
// @filename: MyComponent.tsx
import React from 'react';
import {z} from 'zod';

export const myCompSchema = z.object({
  propOne: z.string(),
  propTwo: z.string(),
});

export const MyComponent: React.FC<z.infer<typeof myCompSchema>> = ({propOne, propTwo}) => {
  return (
    <div>
      <h1>{propOne}</h1>
      <h2>{propTwo}</h2>
    </div>
  );
};

// @filename: Root.tsx
// organize-imports-ignore
// ---cut---
import React from 'react';
import {Composition} from 'remotion';
import {MyComponent, myCompSchema} from './MyComponent';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="my-video"
      component={MyComponent}
      durationInFrames={100}
      fps={30}
      width={1920}
      height={1080}
      schema={myCompSchema}
      defaultProps={{
        propOne: 'Hello World',
        propTwo: 'Welcome to Remotion',
      }}
    />
  );
};
```

## Editing props visually

When you have defined a schema for your props, you can [edit them visually in the Remotion Studio](/docs/visual-editing). This is useful if you want to quickly try out different values for your props.

## Supported types

All schemas that are supported by [Zod](https://zod.dev/) are supported by Remotion.

Remotion requires that the top-level type is a `z.object()`, because the collection of props of a React component is always an object.

In addition to the built in types, the [`@remotion/zod-types` package](/docs/zod-types) also provides types like [`zColor()`](/docs/zod-types/z-color), [`zTextarea()`](/docs/zod-types/z-textarea) and [`zMatrix()`](/docs/zod-types/z-matrix).


🎯 FINAL TIPS
Be specific, not vague
❌ "Make it professional"
✅ "Professional corporate aesthetic with smooth easing (damping: 200)"
Fill ALL variables
Partial templates → partial output
Complete templates → complete, production-ready code
Use real references
"Like Apple" = specific visual language
"Energetic" = too vague (specify damping instead)
Test and iterate
Render once, review
Adjust variables
Regenerate if needed
Keep samples
Save successful fills
Reuse for similar projects
Build your own template library

This framework turns you into a Remotion prompt factory.
No more guessing. Just fill in variables. Get professional animations.
You now have the meta-system for unlimited, high-quality motion graphics.

