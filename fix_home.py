import re
with open('src/features/home/HomeView.tsx', 'r') as f:
    content = f.read()

content = content.replace("      {/* SECTION 4: WHY CHOOSE US */}\n      <AboutSection />", "      {/* SECTION 4: WHY CHOOSE US */}\n      <WhyChooseUs />")

start_idx = content.find("      {/* SECTION 7: CTA CONTACT BANNER */}")
if start_idx != -1:
    end_idx = content.find("    </div>\n  )\n}", start_idx)
    if end_idx != -1:
        new_content = content[:start_idx] + "      {/* SECTION 7: CTA CONTACT BANNER */}\n      <ContactCTA />\n    </div>\n  )\n}"
        with open('src/features/home/HomeView.tsx', 'w') as f:
            f.write(new_content)
        print("Success")
    else:
        print("End not found")
else:
    print("Start not found")
