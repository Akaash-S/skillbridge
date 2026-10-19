#!/usr/bin/env python3
"""
Generate a professional 1200x630 OpenGraph preview image for SkillBridge,
replacing the placeholder Lovable template preview image.
"""

import os
from PIL import Image, ImageDraw, ImageFont

def generate_og():
    width = 1200
    height = 630
    
    # 1. Create base canvas with modern dark slate gradient
    img = Image.new("RGBA", (width, height), (11, 15, 25, 255))
    draw = ImageDraw.Draw(img)
    
    # Radial/angular gradient simulation
    for y in range(height):
        # Blend from dark slate (#0B0F19) to deep indigo/navy (#1E1B4B)
        ratio = y / height
        r = int(11 * (1 - ratio) + 26 * ratio)
        g = int(15 * (1 - ratio) + 22 * ratio)
        b = int(25 * (1 - ratio) + 65 * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        
    # Draw subtle background glow circles
    glow_color = (99, 102, 241, 35) # Indigo glow
    draw.ellipse([800, -100, 1300, 400], fill=glow_color)
    glow_cyan = (14, 165, 233, 25) # Sky cyan glow
    draw.ellipse([-150, 250, 450, 850], fill=glow_cyan)
    
    # 2. Composite SkillBridge Logo
    logo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "skillbridge-logo-light.png")
    if os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path).convert("RGBA")
            logo.thumbnail((260, 260), Image.Resampling.LANCZOS)
            img.paste(logo, (90, 185), logo)
        except Exception as e:
            print(f"Warning: Could not paste logo: {e}")

    # 3. Typography & Text
    # Use standard Windows fonts (Segoe UI or Arial)
    font_title = None
    font_sub = None
    font_badge = None
    
    font_paths = [
        "C:\\Windows\\Fonts\\segoeuib.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            font_title = ImageFont.truetype(fp, 68)
            break
            
    regular_font_paths = [
        "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\arial.ttf",
    ]
    for fp in regular_font_paths:
        if os.path.exists(fp):
            font_sub = ImageFont.truetype(fp, 32)
            font_badge = ImageFont.truetype(fp, 22)
            break
            
    if not font_title:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_badge = ImageFont.load_default()

    # Draw Brand Title & Tagline
    text_x = 380
    draw.text((text_x, 180), "SkillBridge", fill=(255, 255, 255, 255), font=font_title)
    draw.text((text_x, 270), "Bridge the Gap to Your Dream Career", fill=(226, 232, 240, 255), font=font_sub)
    draw.text((text_x, 325), "AI-Powered Skill Gap Analysis & Custom Learning Paths", fill=(148, 163, 184, 255), font=font_sub)

    # 4. Badges (Feature Pills)
    badges = ["⚡ Gemini 2.0 Flash Roadmaps", "📊 Real-Time Market Demand", "🎯 Role Readiness Scoring"]
    badge_x = text_x
    badge_y = 410
    
    for badge in badges:
        # Measure text box
        bbox = draw.textbbox((0, 0), badge, font=font_badge)
        bw = bbox[2] - bbox[0] + 32
        bh = bbox[3] - bbox[1] + 20
        
        # Draw rounded rectangle badge
        draw.rounded_rectangle([badge_x, badge_y, badge_x + bw, badge_y + bh], radius=8, fill=(30, 41, 59, 230), outline=(99, 102, 241, 160), width=1)
        draw.text((badge_x + 16, badge_y + 8), badge, fill=(241, 245, 249, 255), font=font_badge)
        badge_x += bw + 16

    # 5. Bottom Brand Accent Bar
    draw.rectangle([0, height - 8, width, height], fill=(99, 102, 241, 255)) # Indigo-500 line
    
    # Save to public/og-image.png
    out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "og-image.png")
    img.save(out_path, format="PNG")
    print(f"Successfully created OpenGraph banner at: {out_path}")

if __name__ == "__main__":
    generate_og()
