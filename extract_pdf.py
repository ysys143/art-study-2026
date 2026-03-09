import pymupdf as fitz  # PyMuPDF
import re

# First, let's check the PDF info
doc = fitz.open("/Users/jaesolshin/Documents/GitHub/0309-icarus/grossberg_ch2.pdf")
print(f"Total pages: {doc.page_count}")
print(f"Available pages: 0-{doc.page_count - 1}")

# Let's try a broader range to find Section 5
pages_to_check = list(range(60, min(80, doc.page_count)))  # Pages 61-80
text = ""

for page_num in pages_to_check:
    try:
        page = doc.load_page(page_num)
        page_text = page.get_text()
        if (
            "Why Neural Networks?" in page_text
            or "Hartline-Ratliff-Miller" in page_text
        ):
            print("Found relevant content on page {}".format(page_num + 1))
        text += page_text + "\n\n"
    except Exception as e:
        print(f"Error on page {page_num}: {e}")

# Clean up the text
text = re.sub(r"\s+", " ", text)  # Multiple whitespace to single
text = re.sub(r"\n\s*\n", "\n\n", text)  # Empty lines to double newline

# Look for Section 5 content
lines = text.split("\n")
section_lines = []
in_section = False

for line in lines:
    if "Why Neural Networks?" in line:
        in_section = True
        section_lines.append(line)
        print(f"Found section start: {line}")
    elif in_section and len(line.strip()) > 0 and not line.startswith((" ", "\t")):
        # Start of new section
        break
    elif in_section:
        section_lines.append(line)

extracted_text = "\n".join(section_lines)

# Save to file
with open(
    "/Users/jaesolshin/Documents/GitHub/0309-icarus/section_5_content.txt",
    "w",
    encoding="utf-8",
) as f:
    f.write(extracted_text)

print("\nSection 5 content extracted and saved to section_5_content.txt")
print(f"Total characters extracted: {len(extracted_text)}")
print("\nFirst 500 characters:")
print(extracted_text[:500] + "...")
