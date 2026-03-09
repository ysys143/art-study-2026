import pymupdf as fitz
import re

# Extract from pages 19 and 20 (which contain the Section 5 content)
doc = fitz.open("/Users/jaesolshin/Documents/GitHub/0309-icarus/grossberg_ch2.pdf")
pages_needed = [18, 19]  # Pages 19 and 20 (0-indexed)

text = ""
for page_num in pages_needed:
    page = doc.load_page(page_num)
    text += page.get_text() + "\n\n"

# Clean up the text
text = re.sub(r"\s+", " ", text)  # Multiple whitespace to single
text = re.sub(r"\n\s*\n", "\n\n", text)  # Empty lines to double newline

# Extract the specific section content
lines = text.split("\n")
section_lines = []
in_section = False
section_start_found = False

for line in lines:
    # Look for the start of Section 5
    if "Why Neural Networks?" in line:
        in_section = True
        section_start_found = True
        section_lines.append(line)
        print(f"Found section start: {line}")
    # Look for Hartline-Ratliff-Miller or related content
    elif "Hartline-Ratliff-Miller" in line or "limulus retina" in line:
        if not section_start_found:
            # If we haven't found the section title yet, start collecting
            section_start_found = True
            # Add some context before this line
            section_lines.append(line)
        else:
            section_lines.append(line)
    elif in_section and len(line.strip()) > 0 and not line.startswith((" ", "\t")):
        # Start of new section or chapter
        break
    elif in_section:
        section_lines.append(line)

extracted_text = "\n".join(section_lines)

# Save to file
with open(
    "/Users/jaesolshin/Documents/GitHub/0309-icarus/section_5_draft.md",
    "w",
    encoding="utf-8",
) as f:
    f.write(extracted_text)

print("\nSection 5 content extracted and saved to section_5_draft.md")
print(f"Total characters extracted: {len(extracted_text)}")
print("\nFirst 1000 characters:")
print(extracted_text[:1000] + "...")
