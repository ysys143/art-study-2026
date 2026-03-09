import pymupdf as fitz

# Search for content in the PDF
doc = fitz.open("/Users/jaesolshin/Documents/GitHub/0309-icarus/grossberg_ch2.pdf")

# Search for keywords across all pages
search_keywords = [
    "Why Neural Networks?",
    "Hartline-Ratliff-Miller",
    "limulus retina",
    "global limit",
    "oscillation theorems",
    "distributed patterns",
    "multiple-scale feedback",
]

for page_num in range(doc.page_count):
    page = doc.load_page(page_num)
    text = page.get_text()

    for keyword in search_keywords:
        if keyword in text:
            print(f"Found '{keyword}' on page {page_num + 1}")
            # Get some context around the keyword
            lines = text.split("\n")
            for i, line in enumerate(lines):
                if keyword in line:
                    # Print 3 lines before and after
                    start = max(0, i - 3)
                    end = min(len(lines), i + 4)
                    print(f"Context from page {page_num + 1}:")
                    for j in range(start, end):
                        print(f"  {j + 1}: {lines[j]}")
                    print("---")

print("\nDone searching all pages.")
